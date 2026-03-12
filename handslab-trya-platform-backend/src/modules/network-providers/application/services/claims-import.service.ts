import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ListClaimsImportsDto } from '../dto/list-claims-imports.dto';
import { v4 as uuidv4 } from 'uuid';
import { HealthcareClaimEntity } from '../../infrastructure/entities/healthcare-claim.entity';
import { ProviderNameMappingEntity } from '../../infrastructure/entities/provider-name-mapping.entity';
import { ImportEntity } from '../../infrastructure/entities/import.entity';
import { CsvClaimsParserHelper, ClaimRow } from '../../infrastructure/helpers/csv-claims-parser.helper';
import { ExcelClaimsParserHelper } from '../../infrastructure/helpers/excel-claims-parser.helper';
import { ProviderMatchingService } from './provider-matching.service';
import { ClaimImportResponseDto, ClaimImportStatsDto } from '../../presentation/dtos/claims.dto';
import { S3Service } from '../../../../shared/infrastructure/services/s3.service';
import { USER_DB_REPOSITORY_TOKEN } from 'src/modules/users/domain/repositories/user-db.repository.token';
import type { IUserDbRepository } from 'src/modules/users/domain/repositories/user-db.repository.interface';

@Injectable()
export class ClaimsImportService {
  private readonly logger = new Logger(ClaimsImportService.name);

  constructor(
    @InjectRepository(HealthcareClaimEntity)
    private readonly claimsRepository: Repository<HealthcareClaimEntity>,
    @InjectRepository(ProviderNameMappingEntity)
    private readonly mappingsRepository: Repository<ProviderNameMappingEntity>,
    @InjectRepository(ImportEntity)
    private readonly importRepository: Repository<ImportEntity>,
    private readonly providerMatchingService: ProviderMatchingService,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
  ) {}

  /**
   * Importa arquivo CSV de sinistros
   */
  async importClaimsFile(
    file: Express.Multer.File,
    operatorId?: string,
    cognitoId?: string,
  ): Promise<ClaimImportResponseDto> {
    // Validação de tamanho (max 10MB)
    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). O tamanho máximo permitido é ${maxSizeMB}MB.`,
      );
    }

    // Validação de tipo MIME
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo inválido: "${file.mimetype}". Apenas arquivos CSV (.csv) e Excel (.xlsx, .xls) são aceitos.`,
      );
    }

    const startTime = Date.now();
    const batchId = uuidv4();

    this.logger.log(`Starting claims import - Batch: ${batchId}`);

    // Get user ID from Cognito ID
    let userId: string | undefined;
    if (cognitoId) {
      const user = await this.userDbRepository.findByCognitoId(cognitoId);
      userId = user?.id;
    }

    // Create import record
    const importRecord = this.importRepository.create({
      filename: file.originalname,
      operatorId,
      userId,
      importType: 'claim',
      status: 'processing',
      processedRows: 0,
      importedClaims: 0,
      matchedClaims: 0,
      unmatchedClaims: 0,
      avgMatchConfidence: 0,
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

    try {
      // 1. Parse CSV or Excel based on file type
      let parseResult;
      const isExcel =
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.originalname.toLowerCase().endsWith('.xlsx') ||
        file.originalname.toLowerCase().endsWith('.xls');

      if (isExcel) {
        parseResult = ExcelClaimsParserHelper.parseClaimsExcel(file.buffer);
      } else {
        parseResult = await CsvClaimsParserHelper.parseClaimsCSV(file.buffer);
      }

      // 2. Validate headers structure
      const headerValidation = isExcel
        ? ExcelClaimsParserHelper.validateClaimsStructure(parseResult.headers)
        : CsvClaimsParserHelper.validateClaimsStructure(parseResult.headers);
      if (!headerValidation.valid) {
        const errorMessage = `Cabeçalhos inválidos ou ausentes: ${headerValidation.missingColumns.join(', ')}`;
        importRecord.status = 'failed';
        importRecord.errorMessage = errorMessage;
        importRecord.completedAt = new Date();
        await this.importRepository.save(importRecord);
        throw new BadRequestException(errorMessage);
      }

      // 3. Validate data rows are not empty
      if (parseResult.rows.length === 0) {
        const errorMessage = 'Nenhuma linha de dados válida encontrada no arquivo';
        importRecord.status = 'failed';
        importRecord.errorMessage = errorMessage;
        importRecord.completedAt = new Date();
        await this.importRepository.save(importRecord);
        throw new BadRequestException(errorMessage);
      }

      // Update total rows
      importRecord.totalRows = parseResult.stats.totalRows;
      await this.importRepository.save(importRecord);

      this.logger.log(
        `Parsed ${parseResult.stats.validRows} valid rows, ${parseResult.stats.invalidRows} invalid rows`,
      );

      if (parseResult.stats.errors.length > 0) {
        this.logger.warn(`Parsing errors: ${parseResult.stats.errors.slice(0, 5).join('; ')}`);
      }

      // 2. Load manual mappings cache
      await this.loadManualMappings();

      // 3. Process claims in batches
      const batchSize = 100;
      const claims: HealthcareClaimEntity[] = [];
      const stats: ClaimImportStatsDto = {
        totalRows: parseResult.stats.totalRows,
        importedClaims: 0,
        matchedClaims: 0,
        unmatchedClaims: 0,
        errorRows: parseResult.stats.invalidRows,
        avgMatchConfidence: 0,
        matchMethodDistribution: {
          exact: 0,
          fuzzy: 0,
          manual: 0,
          none: 0,
        },
      };

      const unmatchedProviders = new Set<string>();
      let totalConfidence = 0;
      let confidenceCount = 0;

      // Process in batches
      for (let i = 0; i < parseResult.rows.length; i += batchSize) {
        const batch = parseResult.rows.slice(i, i + batchSize);

        for (const row of batch) {
          try {
            const claim = await this.processClaimRow(row, batchId, operatorId);
            claims.push(claim);
            stats.importedClaims++;

            if (claim.providerId) {
              stats.matchedClaims++;
              if (claim.matchingConfidence) {
                totalConfidence += claim.matchingConfidence;
                confidenceCount++;
              }
            } else {
              stats.unmatchedClaims++;
              unmatchedProviders.add(row.prestador);
            }
          } catch (error) {
            this.logger.warn(`Error processing claim row: ${error.message}`);
            stats.errorRows++;
          }
        }

        // Save batch
        if (claims.length > 0) {
          await this.saveBatch(claims);
          this.logger.log(`Saved batch of ${claims.length} claims`);
          claims.length = 0; // Clear array
        }
      }

      // Calculate average confidence
      stats.avgMatchConfidence =
        confidenceCount > 0
          ? Math.round((totalConfidence / confidenceCount) * 100) / 100
          : 0;

      const endTime = Date.now();
      const processingTimeSeconds = Math.round((endTime - startTime) / 1000);

      // Update import record with success status
      importRecord.status = 'completed';
      importRecord.processedRows = stats.importedClaims;
      importRecord.importedClaims = stats.importedClaims;
      importRecord.matchedClaims = stats.matchedClaims;
      importRecord.unmatchedClaims = stats.unmatchedClaims;
      importRecord.avgMatchConfidence = stats.avgMatchConfidence;
      importRecord.completedAt = new Date();
      await this.importRepository.save(importRecord);

      this.logger.log(
        `Import completed - ${stats.importedClaims} claims imported in ${processingTimeSeconds}s`,
      );

      return {
        batchId,
        importedAt: new Date(),
        stats,
        errors: parseResult.stats.errors,
        unmatchedProviders: Array.from(unmatchedProviders).slice(0, 20),
        processingTimeSeconds,
      };
    } catch (error) {
      this.logger.error(`Import failed: ${error.message}`, error.stack);
      
      // Update import record with failed status
      importRecord.status = 'failed';
      importRecord.errorMessage = error.message;
      importRecord.completedAt = new Date();
      await this.importRepository.save(importRecord);
      
      throw error;
    }
  }

  /**
   * Processa uma linha do CSV e cria entidade de claim
   */
  private async processClaimRow(
    row: ClaimRow,
    batchId: string,
    operatorId?: string,
  ): Promise<HealthcareClaimEntity> {
    // Match provider (opcional - tenta encontrar o prestador cadastrado)
    const matchResult = await this.providerMatchingService.findMatchingProvider(
      row.prestador,
    );

    // Save mapping if not exists
    if (matchResult.matchMethod !== 'none') {
      await this.saveMappingIfNew(
        row.prestador,
        matchResult.providerId,
        matchResult.confidence,
        matchResult.matchMethod === 'manual',
      );
    }

    // Create claim entity
    const claim = new HealthcareClaimEntity();
    claim.operatorName = row.operadora;
    claim.networkName = row.rede;
    claim.providerName = row.prestador;
    claim.specialty = row.elementoDivulgacao;
    claim.claimValue = parseFloat(row.sinistro) || 0;
    claim.providerId = matchResult.providerId;
    claim.matchingConfidence = matchResult.confidence;
    claim.importBatchId = batchId;

    return claim;
  }

  /**
   * Salva batch de claims no banco
   */
  private async saveBatch(claims: HealthcareClaimEntity[]): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.save(HealthcareClaimEntity, claims);
    });
  }

  /**
   * Salva mapeamento de nome se não existir
   */
  private async saveMappingIfNew(
    rawName: string,
    providerId: string | null,
    confidence: number,
    isManual: boolean,
  ): Promise<void> {
    const existing = await this.mappingsRepository.findOne({
      where: { rawName },
    });

    if (!existing) {
      const mapping = new ProviderNameMappingEntity();
      mapping.rawName = rawName;
      mapping.normalizedName = this.normalizeName(rawName);
      mapping.providerId = providerId;
      mapping.confidence = confidence;
      mapping.isManual = isManual;

      await this.mappingsRepository.save(mapping);
    }
  }

  /**
   * Carrega mapeamentos manuais no cache do matching service
   */
  private async loadManualMappings(): Promise<void> {
    const manualMappings = await this.mappingsRepository.find({
      where: { isManual: true },
    });

    for (const mapping of manualMappings) {
      if (mapping.providerId) {
        this.providerMatchingService.addManualMapping(
          mapping.rawName,
          mapping.providerId,
        );
      }
    }

    this.logger.log(`Loaded ${manualMappings.length} manual mappings`);
  }



  /**
   * Normalize name (same as matching service)
   */
  private normalizeName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Deleta claims de um batch específico
   */
  async deleteBatch(batchId: string): Promise<number> {
    const result = await this.claimsRepository.delete({ importBatchId: batchId });
    return result.affected || 0;
  }

  /**
   * Lista batches de importação
   */
  async listBatches(): Promise<
    Array<{ batchId: string; count: number; importedAt: Date }>
  > {
    const results = await this.claimsRepository
      .createQueryBuilder('claim')
      .select('claim.import_batch_id', 'batchId')
      .addSelect('COUNT(*)', 'count')
      .addSelect('MIN(claim.created_at)', 'importedAt')
      .where('claim.import_batch_id IS NOT NULL')
      .groupBy('claim.import_batch_id')
      .orderBy('"importedAt"', 'DESC')
      .getRawMany();

    return results.map((r) => ({
      batchId: r.batchId,
      count: parseInt(r.count),
      importedAt: new Date(r.importedAt),
    }));
  }

  /**
   * Reprocessa uma importacao usando o arquivo salvo no S3
   */
  async reprocessImport(
    importId: string,
    cognitoId?: string,
  ): Promise<ClaimImportResponseDto> {
    const importRecord = await this.importRepository.findOne({
      where: { id: importId, importType: 'claim' },
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
      `Reprocessing claims import ${importId} using file from S3: ${importRecord.fileKey}`,
    );

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

    return this.importClaimsFile(
      file,
      importRecord.operatorId,
      cognitoId,
    );
  }

  /**
   * Obtém a última importação de claims (opcionalmente filtrada por operador)
   */
  async getLatestImport(operatorId?: string): Promise<any | null> {
    const where: Record<string, any> = { importType: 'claim' };
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
      status: importRecord.status,
      summary: {
        totalRows: importRecord.totalRows,
        importedClaims: importRecord.importedClaims,
        matchedClaims: importRecord.matchedClaims,
        unmatchedClaims: importRecord.unmatchedClaims,
        avgMatchConfidence: importRecord.avgMatchConfidence,
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
    };
  }

  /**
   * Obtém todas as importações de claims (opcionalmente filtradas por operador)
   */
  async getAllImports(dto: ListClaimsImportsDto = {}): Promise<{
    imports: any[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { page = 1, limit = 10, status, search, operatorId } = dto;

    const qb = this.importRepository
      .createQueryBuilder('import')
      .leftJoinAndSelect('import.user', 'user')
      .where('import.importType = :importType', { importType: 'claim' })
      .orderBy('import.startedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (operatorId) {
      qb.andWhere('import.operatorId = :operatorId', { operatorId });
    }

    if (status) {
      qb.andWhere('import.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(import.filename ILIKE :search OR user.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [records, total] = await qb.getManyAndCount();

    const imports = records.map((importRecord) => ({
      id: importRecord.id,
      filename: importRecord.filename,
      userName: importRecord.user?.name,
      status: importRecord.status,
      summary: {
        totalRows: importRecord.totalRows,
        importedClaims: importRecord.importedClaims,
        matchedClaims: importRecord.matchedClaims,
        unmatchedClaims: importRecord.unmatchedClaims,
        avgMatchConfidence: importRecord.avgMatchConfidence,
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

    return {
      imports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
