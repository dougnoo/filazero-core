import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LocationEntity } from '../../infrastructure/entities/location.entity';
import { ProviderEntity } from '../../infrastructure/entities/provider.entity';
import { ServiceEntity } from '../../infrastructure/entities/service.entity';
import { ImportEntity } from '../../infrastructure/entities/import.entity';
import { CsvParserHelper } from '../../infrastructure/helpers/csv-parser.helper';
import { FileValidatorHelper } from '../../infrastructure/helpers/file-validator.helper';
import { ImportResponseDto } from '../../presentation/dtos/import-response.dto';
import { ImportSummaryDto } from '../../presentation/dtos/import-summary.dto';
import { BatchProcessor } from './batch-processor';
import { BatchOperationRepository } from '../../infrastructure/repositories/batch-operation.repository';
import { S3Service } from '../../../../shared/infrastructure/services/s3.service';
import { Inject } from '@nestjs/common';
import { USER_DB_REPOSITORY_TOKEN } from 'src/modules/users/domain/repositories/user-db.repository.token';
import type { IUserDbRepository } from 'src/modules/users/domain/repositories/user-db.repository.interface';

@Injectable()
export class ImportProvidersService {
  private readonly logger = new Logger(ImportProvidersService.name);
  private readonly batchProcessor: BatchProcessor;

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepository: Repository<LocationEntity>,
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>,
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
    @InjectRepository(ImportEntity)
    private readonly importRepository: Repository<ImportEntity>,
    private readonly dataSource: DataSource,
    private readonly batchOperationRepository: BatchOperationRepository,
    private readonly s3Service: S3Service,
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
  ) {
    this.batchProcessor = new BatchProcessor(
      dataSource,
      batchOperationRepository,
    );
  }

  async importFile(
    file: Express.Multer.File,
    operatorId?: string,
    operatorName?: string,
    cognitoId?: string,
  ): Promise<ImportResponseDto> {
    this.logger.log(`Starting import of file: ${file.originalname}`);
    if (operatorId) {
      this.logger.log(`Operator ID: ${operatorId}`);
    }
    if (operatorName) {
      this.logger.log(`Operator Name: ${operatorName}`);
    }

    // Get user ID from Cognito ID
    let userId: string | undefined;
    if (cognitoId) {
      const user = await this.userDbRepository.findByCognitoId(cognitoId);
      userId = user?.id;
    }

    const isExcel =
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel';

    // For Excel files, do quick validation first using sample
    if (isExcel && operatorName) {
      try {
        this.logger.log('Performing quick operator validation using sample...');
        const sample = CsvParserHelper.parseXLSXSample(file.buffer, 500);

        // Validate columns
        const columnValidation = FileValidatorHelper.validateColumns(
          sample.headers,
        );
        if (columnValidation.forbiddenColumns.length > 0) {
          throw new BadRequestException(
            FileValidatorHelper.formatForbiddenColumnsError(
              columnValidation.forbiddenColumns,
            ),
          );
        }
        if (!columnValidation.valid) {
          throw new BadRequestException(
            FileValidatorHelper.formatMissingColumnsError(
              columnValidation.missingColumns,
            ),
          );
        }

        // Validate operator compatibility using sample
        const operatorValidation =
          FileValidatorHelper.validateOperatorCompatibility(
            sample.sampleRows,
            sample.headers,
            operatorName,
          );

        if (!operatorValidation.valid) {
          const errorMessage =
            FileValidatorHelper.formatOperatorMismatchError(operatorValidation);
          this.logger.warn(
            `Operator mismatch detected in sample: ${operatorValidation.foundOperators.join(', ')} vs expected ${operatorName}`,
          );
          throw new BadRequestException(errorMessage);
        }

        this.logger.log(
          `Quick operator validation passed. Total rows estimated: ${sample.totalRows}`,
        );
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        this.logger.error(
          `Quick validation failed: ${error.message}`,
          error.stack,
        );
        throw new BadRequestException(
          `Erro ao validar arquivo: ${error.message}`,
        );
      }
    }

    // Create import record with operator info
    const importRecord = this.importRepository.create({
      filename: file.originalname,
      operatorId,
      operatorName,
      userId,
      importType: 'provider',
      status: 'processing',
      processedRows: 0,
      newLocations: 0,
      newProviders: 0,
      newServices: 0,
      startedAt: new Date(),
    });
    await this.importRepository.save(importRecord);

    // Save file to S3 for future reprocessing
    try {
      const fileKey = this.s3Service.generateImportFileKey(
        importRecord.id,
        file.originalname,
      );
      await this.s3Service.uploadFile(
        fileKey,
        file.buffer,
        file.mimetype,
      );
      importRecord.fileKey = fileKey;
      await this.importRepository.save(importRecord);
      this.logger.log(`File saved to S3: ${fileKey}`);
    } catch (error) {
      this.logger.error(
        `Failed to save file to S3: ${error.message}`,
        error.stack,
      );
      // Continue with import even if S3 upload fails
    }

    // Parse full file
    let parseResult;
    try {
      parseResult = await CsvParserHelper.parse(file.buffer, file.mimetype);
      importRecord.totalRows = parseResult.rows.length;
      await this.importRepository.save(importRecord);
      this.logger.log(`Parsed ${parseResult.rows.length} rows from file`);

      // For CSV files, validate operator compatibility here
      if (!isExcel && operatorName) {
        const operatorValidation =
          FileValidatorHelper.validateOperatorCompatibility(
            parseResult.rows,
            parseResult.headers,
            operatorName,
          );

        if (!operatorValidation.valid) {
          const errorMessage =
            FileValidatorHelper.formatOperatorMismatchError(operatorValidation);
          this.logger.warn(
            `Operator mismatch detected: ${operatorValidation.foundOperators.join(', ')} vs expected ${operatorName}`,
          );

          importRecord.status = 'failed';
          importRecord.errorMessage = errorMessage;
          importRecord.completedAt = new Date();
          await this.importRepository.save(importRecord);

          throw new BadRequestException(errorMessage);
        }

        this.logger.log(`Operator validation passed: ${operatorName}`);
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`File parsing failed: ${error.message}`, error.stack);
      importRecord.status = 'failed';
      importRecord.errorMessage = error.message;
      importRecord.completedAt = new Date();
      await this.importRepository.save(importRecord);
      throw error;
    }

    // Process in background (don't await) for large files
    const rows = parseResult.rows;
    if (rows.length > 100) {
      this.logger.log(
        `Large file detected (${rows.length} rows). Processing asynchronously...`,
      );

      // Start async processing
      this.processImportAsync(importRecord, rows, operatorId).catch((error) => {
        this.logger.error(`Async import failed: ${error.message}`, error.stack);
      });

      // Return immediately with processing status
      return {
        success: true,
        importId: importRecord.id,
        summary: {
          totalRows: rows.length,
          processedRows: 0,
          newLocations: 0,
          newProviders: 0,
          newServices: 0,
        },
        geocoding: {
          pending: 0,
          estimatedTimeMinutes: Math.ceil(rows.length / 500),
        },
      };
    }

    // For small files, process synchronously
    return this.processImportSync(importRecord, rows, operatorId);
  }

  /**
   * Process import asynchronously for large files
   */
  private async processImportAsync(
    importRecord: ImportEntity,
    rows: Record<string, string>[],
    operatorId?: string,
  ): Promise<void> {
    try {
      // Clear existing data only for this operator
      await this.clearData(operatorId);

      // Set operatorId for batch processor
      this.batchProcessor.setOperatorId(operatorId);

      // Process rows in batches
      const BATCH_SIZE = 500;
      const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        this.logger.log(
          `[Async] Processing batch ${batchNumber}/${totalBatches} (${batch.length} rows)`,
        );

        try {
          const batchResult = await this.batchProcessor.processBatch(batch);
          importRecord.newLocations += batchResult.locationsAdded;
          importRecord.newProviders += batchResult.providersAdded;
          importRecord.newServices += batchResult.servicesAdded;
          importRecord.processedRows += batch.length;

          // Update progress periodically
          if (batchNumber % 5 === 0 || batchNumber === totalBatches) {
            await this.importRepository.save(importRecord);
          }
        } catch (error) {
          this.logger.error(
            `[Async] Error processing batch ${batchNumber}: ${error.message}`,
            error.stack,
          );
        }
      }

      // Clean orphan locations
      await this.cleanOrphanLocations();

      // Complete import
      importRecord.status = 'completed';
      importRecord.completedAt = new Date();
      await this.importRepository.save(importRecord);

      this.logger.log(
        `[Async] Import completed. Processed: ${importRecord.processedRows}, ` +
          `New locations: ${importRecord.newLocations}, ` +
          `New providers: ${importRecord.newProviders}`,
      );
    } catch (error) {
      this.logger.error(`[Async] Import failed: ${error.message}`, error.stack);
      importRecord.status = 'failed';
      importRecord.errorMessage = error.message;
      importRecord.completedAt = new Date();
      await this.importRepository.save(importRecord);
    }
  }

  /**
   * Process import synchronously for small files
   */
  private async processImportSync(
    importRecord: ImportEntity,
    rows: Record<string, string>[],
    operatorId?: string,
  ): Promise<ImportResponseDto> {
    try {
      // Clear existing data only for this operator
      await this.clearData(operatorId);

      // Set operatorId for batch processor
      this.batchProcessor.setOperatorId(operatorId);

      // Process rows in batches
      const BATCH_SIZE = 500;
      const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        this.logger.log(
          `Processing batch ${batchNumber}/${totalBatches} (${batch.length} rows)`,
        );

        try {
          const batchResult = await this.batchProcessor.processBatch(batch);
          importRecord.newLocations += batchResult.locationsAdded;
          importRecord.newProviders += batchResult.providersAdded;
          importRecord.newServices += batchResult.servicesAdded;
          importRecord.processedRows += batch.length;
        } catch (error) {
          this.logger.error(
            `Error processing batch ${batchNumber}: ${error.message}`,
            error.stack,
          );
        }
      }

      // Clean orphan locations
      await this.cleanOrphanLocations();

      // Complete import
      importRecord.status = 'completed';
      importRecord.completedAt = new Date();
      await this.importRepository.save(importRecord);

      // Count pending geocoding
      const pendingCount = await this.locationRepository.count({
        where: { geocodingStatus: 'pending' },
      });

      this.logger.log(
        `Import completed. Processed: ${importRecord.processedRows}, ` +
          `New locations: ${importRecord.newLocations}, ` +
          `New providers: ${importRecord.newProviders}`,
      );

      return {
        success: true,
        importId: importRecord.id,
        summary: {
          totalRows: importRecord.totalRows || 0,
          processedRows: importRecord.processedRows,
          newLocations: importRecord.newLocations,
          newProviders: importRecord.newProviders,
          newServices: importRecord.newServices,
        },
        geocoding: {
          pending: pendingCount,
          estimatedTimeMinutes: Math.ceil(pendingCount / 60),
        },
      };
    } catch (error) {
      this.logger.error(`Import failed: ${error.message}`, error.stack);
      importRecord.status = 'failed';
      importRecord.errorMessage = error.message;
      importRecord.completedAt = new Date();
      await this.importRepository.save(importRecord);

      throw error;
    }
  }

  private async clearData(operatorId?: string): Promise<void> {
    if (operatorId) {
      this.logger.log(`Clearing existing data for operator: ${operatorId}`);
      await this.batchOperationRepository.clearServicesByOperator(operatorId);
      await this.batchOperationRepository.clearProvidersByOperator(operatorId);
    } else {
      this.logger.log(
        'Warning: No operatorId provided, skipping data clear to prevent data loss',
      );
    }
  }

  private async cleanOrphanLocations(): Promise<void> {
    this.logger.log('Cleaning orphan locations...');
    await this.batchOperationRepository.deleteOrphanLocations();
  }

  async getLatestImport(operatorId?: string): Promise<ImportSummaryDto | null> {
    const where: Record<string, any> = { importType: 'provider' };
    if (operatorId) {
      where.operatorId = operatorId;
    }

    const importRecord = await this.importRepository.findOne({
      where,
      order: { startedAt: 'DESC' },
    });

    if (!importRecord) return null;

    return {
      id: importRecord.id,
      filename: importRecord.filename,
      operatorId: importRecord.operatorId,
      operatorName: importRecord.operatorName,
      status: importRecord.status,
      summary: {
        totalRows: importRecord.totalRows,
        processedRows: importRecord.processedRows,
        newLocations: importRecord.newLocations,
        newProviders: importRecord.newProviders,
        newServices: importRecord.newServices,
      },
      startedAt: importRecord.startedAt,
      completedAt: importRecord.completedAt,
      durationSeconds: importRecord.completedAt
        ? Math.floor(
            (importRecord.completedAt.getTime() -
              importRecord.startedAt.getTime()) /
              1000,
          )
        : undefined,
      errorMessage: importRecord.errorMessage,
      fileKey: importRecord.fileKey,
    };
  }

  async getImportsByOperator(operatorId: string): Promise<ImportSummaryDto[]> {
    const imports = await this.importRepository.find({
      where: { operatorId, importType: 'provider' },
      order: { startedAt: 'DESC' },
      take: 50,
    });

    return imports.map((importRecord) => ({
      id: importRecord.id,
      filename: importRecord.filename,
      operatorId: importRecord.operatorId,
      operatorName: importRecord.operatorName,
      status: importRecord.status,
      summary: {
        totalRows: importRecord.totalRows,
        processedRows: importRecord.processedRows,
        newLocations: importRecord.newLocations,
        newProviders: importRecord.newProviders,
        newServices: importRecord.newServices,
      },
      startedAt: importRecord.startedAt,
      completedAt: importRecord.completedAt,
      durationSeconds: importRecord.completedAt
        ? Math.floor(
            (importRecord.completedAt.getTime() -
              importRecord.startedAt.getTime()) /
              1000,
          )
        : undefined,
      errorMessage: importRecord.errorMessage,
    }));
  }

  async getAllImports(): Promise<ImportSummaryDto[]> {
    const imports = await this.importRepository.find({
      where: { importType: 'provider' },
      order: { startedAt: 'DESC' },
      take: 100,
    });

    return imports.map((importRecord) => ({
      id: importRecord.id,
      filename: importRecord.filename,
      operatorId: importRecord.operatorId,
      operatorName: importRecord.operatorName,
      status: importRecord.status,
      summary: {
        totalRows: importRecord.totalRows,
        processedRows: importRecord.processedRows,
        newLocations: importRecord.newLocations,
        newProviders: importRecord.newProviders,
        newServices: importRecord.newServices,
      },
      startedAt: importRecord.startedAt,
      completedAt: importRecord.completedAt,
      durationSeconds: importRecord.completedAt
        ? Math.floor(
            (importRecord.completedAt.getTime() -
              importRecord.startedAt.getTime()) /
              1000,
          )
        : undefined,
      errorMessage: importRecord.errorMessage,
    }));
  }

  /**
   * Reprocess a failed import using the file saved in S3
   */
  async reprocessImport(importId: string): Promise<ImportResponseDto> {
    const importRecord = await this.importRepository.findOne({
      where: { id: importId },
    });

    if (!importRecord) {
      throw new BadRequestException(`Import with ID ${importId} not found`);
    }

    if (!importRecord.fileKey) {
      throw new BadRequestException(
        'File not found in S3. Cannot reprocess this import.',
      );
    }

    this.logger.log(
      `Reprocessing import ${importId} using file from S3: ${importRecord.fileKey}`,
    );

    // Download file from S3
    let fileBuffer: Buffer;
    try {
      fileBuffer = await this.s3Service.downloadFile(importRecord.fileKey);
    } catch (error) {
      this.logger.error(
        `Failed to download file from S3: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to download file from S3: ${error.message}`,
      );
    }

    // Create a mock file object for processing
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: importRecord.filename,
      encoding: '7bit',
      mimetype:
        importRecord.filename.endsWith('.xlsx') ||
        importRecord.filename.endsWith('.xls')
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv',
      buffer: fileBuffer,
      size: fileBuffer.length,
      destination: '',
      filename: importRecord.filename,
      path: '',
      stream: null as any,
    };

    // Process the import using the existing logic
    return this.importFile(file, importRecord.operatorId, importRecord.operatorName);
  }

  async downloadImportFile(importId: string): Promise<{
    fileBuffer: Buffer;
    filename: string;
  }> {
    // Find import record
    const importRecord = await this.importRepository.findOne({
      where: { id: importId },
    });

    if (!importRecord) {
      throw new BadRequestException(`Import ${importId} not found`);
    }

    if (!importRecord.fileKey) {
      throw new BadRequestException(
        'File not found in S3. This import does not have a saved file.',
      );
    }

    // Download file from S3
    let fileBuffer: Buffer;
    try {
      fileBuffer = await this.s3Service.downloadFile(importRecord.fileKey);
    } catch (error) {
      this.logger.error(
        `Failed to download file from S3: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to download file from S3: ${error.message}`,
      );
    }

    return {
      fileBuffer,
      filename: importRecord.filename,
    };
  }
}
