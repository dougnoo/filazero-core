import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type {
  IMedicalCertificateRepository,
  IUploadResult,
  SearchFilters,
} from '../../domain/interfaces/medical-certificate.repository.interface';
import {
  MedicalCertificate,
  AnalysisStatus,
  ValidationResult,
} from '../../../../database/entities/medical-certificate.entity';
import {
  BedrockValidationService,
  ValidationResponse,
} from '../services/bedrock-validation.service';

@Injectable()
export class S3MedicalCertificateRepository implements IMedicalCertificateRepository {
  private readonly logger = new Logger(S3MedicalCertificateRepository.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(
    @InjectRepository(MedicalCertificate)
    private readonly certificateRepository: Repository<MedicalCertificate>,
    private readonly configService: ConfigService,
    private readonly bedrockValidationService: BedrockValidationService,
  ) {
    // Usa a região específica do bucket S3, não a região geral da AWS
    this.region = this.configService.get<string>(
      'aws.s3.bucketRegion',
      'sa-east-1',
    );
    this.bucketName = this.configService.get<string>('aws.s3.bucketName')!;

    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    this.s3Client = new S3Client({
      region: this.region,
      ...(profile ? { profile } : {}),
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: { accessKeyId, secretAccessKey },
          }
        : {}),
    });
  }

  async upload(
    file: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<IUploadResult> {
    const timestamp = Date.now();
    const s3Key = `medical-certificates/${timestamp}-${fileName}`;

    this.logger.log(`Iniciando upload do atestado: ${fileName}`);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      Body: file,
      ContentType: mimeType,
    });

    await this.s3Client.send(command);
    this.logger.log(`Upload concluído para S3: ${s3Key}`);

    const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${s3Key}`;

    return {
      fileUrl,
      s3Key,
    };
  }

  async analyzeAsync(
    certificateId: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    this.logger.log(
      `Iniciando análise assíncrona do atestado ${certificateId}`,
    );

    // Executa a análise em background sem bloquear
    setImmediate(async () => {
      try {
        // Busca o certificado para obter dados do paciente
        const certificate = await this.certificateRepository.findOne({
          where: { id: certificateId },
          relations: ['user'],
        });

        if (!certificate) {
          this.logger.error(`Certificado ${certificateId} não encontrado`);
          return;
        }

        // Marca como processando
        await this.certificateRepository.update(certificateId, {
          analysisStatus: AnalysisStatus.PROCESSING,
        });

        this.logger.log(`Validando atestado ${certificateId} com Bedrock`);
        const validationResult =
          await this.bedrockValidationService.validateMedicalCertificate(
            fileBuffer,
            mimeType,
            {
              patientName: certificate.user?.name,
              uploadDate: certificate.createdAt,
            },
          );

        // Atualiza com os resultados da validação
        await this.certificateRepository.update(certificateId, {
          analysisStatus: AnalysisStatus.COMPLETED,
          confidenceScore: validationResult.confidenceScore,
          aiConclusion: validationResult.conclusion,
          crmValidation: validationResult.crmValidation,
          crmObservation: validationResult.crmObservation,
          authenticityValidation: validationResult.authenticityValidation,
          authenticityObservation: validationResult.authenticityObservation,
          signatureValidation: validationResult.signatureValidation,
          signatureObservation: validationResult.signatureObservation,
          dateValidation: validationResult.dateValidation,
          dateObservation: validationResult.dateObservation,
          legibilityValidation: validationResult.legibilityValidation,
          legibilityObservation: validationResult.legibilityObservation,
        });

        this.logger.log(
          `Análise concluída para atestado ${certificateId}: Confiança ${validationResult.confidenceScore}%`,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido';
        this.logger.error(`Erro ao analisar atestado ${certificateId}:`, error);

        // Marca como falha
        await this.certificateRepository.update(certificateId, {
          analysisStatus: AnalysisStatus.FAILED,
          aiConclusion: `Erro na análise: ${errorMessage}`,
        });
      }
    });
  }

  async save(
    certificate: Partial<MedicalCertificate>,
  ): Promise<MedicalCertificate> {
    const newCertificate = this.certificateRepository.create(certificate);
    return await this.certificateRepository.save(newCertificate);
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<MedicalCertificate>,
  ): Promise<MedicalCertificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { id, tenantId },
    });

    if (!certificate) {
      throw new Error('Atestado não encontrado');
    }

    Object.assign(certificate, data);
    return await this.certificateRepository.save(certificate);
  }

  async updateWithValidation(
    certificateId: string,
    tenantId: string,
    file: Buffer,
    mimeType: string,
  ): Promise<MedicalCertificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { id: certificateId, tenantId },
      relations: ['user'],
    });

    if (!certificate) {
      throw new Error('Atestado não encontrado');
    }

    this.logger.log(
      `Atualizando atestado ${certificateId} com validação do Bedrock`,
    );

    // Marca como processando
    certificate.analysisStatus = AnalysisStatus.PROCESSING;
    await this.certificateRepository.save(certificate);

    try {
      // Valida com Bedrock passando contexto do paciente
      const validationResult =
        await this.bedrockValidationService.validateMedicalCertificate(
          file,
          mimeType,
          {
            patientName: certificate.user?.name,
            uploadDate: certificate.createdAt,
          },
        );

      // Atualiza com os resultados da validação
      certificate.analysisStatus = AnalysisStatus.COMPLETED;
      certificate.confidenceScore = validationResult.confidenceScore;
      certificate.aiConclusion = validationResult.conclusion;
      certificate.crmValidation = validationResult.crmValidation;
      certificate.crmObservation = validationResult.crmObservation;
      certificate.authenticityValidation =
        validationResult.authenticityValidation;
      certificate.authenticityObservation =
        validationResult.authenticityObservation;
      certificate.signatureValidation = validationResult.signatureValidation;
      certificate.signatureObservation = validationResult.signatureObservation;
      certificate.dateValidation = validationResult.dateValidation;
      certificate.dateObservation = validationResult.dateObservation;
      certificate.legibilityValidation = validationResult.legibilityValidation;
      certificate.legibilityObservation =
        validationResult.legibilityObservation;

      this.logger.log(
        `Validação concluída para atestado ${certificateId}: Confiança ${validationResult.confidenceScore}%`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao validar atestado ${certificateId}:`, error);
      certificate.analysisStatus = AnalysisStatus.FAILED;
      certificate.aiConclusion = `Erro na análise: ${errorMessage}`;
    }

    return await this.certificateRepository.save(certificate);
  }

  async findByUserId(
    userId: string,
    tenantId: string,
    page: number,
    limit: number,
    filters?: SearchFilters,
  ) {
    const queryBuilder = this.certificateRepository
      .createQueryBuilder('certificate')
      .where('certificate.userId = :userId', { userId })
      .andWhere('certificate.tenantId = :tenantId', { tenantId })
      .orderBy('certificate.createdAt', 'DESC');

    // Apply date filter
    if (filters?.date) {
      queryBuilder.andWhere('DATE(certificate.createdAt) = :date', {
        date: filters.date,
      });
    }

    // Apply status filter
    if (filters?.status) {
      queryBuilder.andWhere('certificate.status = :status', {
        status: filters.status,
      });
    }

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByTenantId(
    tenantId: string,
    page: number,
    limit: number,
    filters?: SearchFilters,
  ) {
    const queryBuilder = this.certificateRepository
      .createQueryBuilder('certificate')
      .leftJoinAndSelect('certificate.user', 'user')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .leftJoinAndSelect('user.userPlans', 'userPlan')
      .leftJoinAndSelect('userPlan.plan', 'plan')
      .where('certificate.tenantId = :tenantId', { tenantId })
      .orderBy('certificate.createdAt', 'DESC');

    // Apply search filters
    if (filters?.name) {
      queryBuilder.andWhere('LOWER(user.name) LIKE LOWER(:name)', {
        name: `%${filters.name}%`,
      });
    }

    if (filters?.date) {
      queryBuilder.andWhere('DATE(certificate.createdAt) = :date', {
        date: filters.date,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('certificate.status = :status', {
        status: filters.status,
      });
    }

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<MedicalCertificate | null> {
    return await this.certificateRepository.findOne({
      where: { id, tenantId },
    });
  }

  async findPendingAnalysis(limit: number = 50): Promise<MedicalCertificate[]> {
    return await this.certificateRepository.find({
      where: [
        { analysisStatus: AnalysisStatus.PENDING },
        { analysisStatus: AnalysisStatus.FAILED },
      ],
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async findByIdWithRelations(
    id: string,
    tenantId: string,
  ): Promise<MedicalCertificate | null> {
    return await this.certificateRepository.findOne({
      where: { id, tenantId },
      relations: [
        'user',
        'user.tenant',
        'user.userPlans',
        'user.userPlans.plan',
      ],
    });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const certificate = await this.findById(id, tenantId);

    if (certificate) {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: certificate.s3Key,
      });

      await this.s3Client.send(command);
      await this.certificateRepository.delete(id);
    }
  }

  async generatePresignedUrl(
    s3Key: string,
    expiresIn: number = 900,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
