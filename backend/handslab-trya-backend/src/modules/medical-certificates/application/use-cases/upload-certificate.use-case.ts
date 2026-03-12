import { Inject, Injectable } from '@nestjs/common';
import type { IMedicalCertificateRepository } from '../../domain/interfaces/medical-certificate.repository.interface';
import { MEDICAL_CERTIFICATE_REPOSITORY_TOKEN } from '../../domain/interfaces/medical-certificate.repository.interface';
import { UploadCertificateDto } from '../dto/upload-certificate.dto';
import { AnalysisStatus } from '../../../../database/entities/medical-certificate.entity';

@Injectable()
export class UploadCertificateUseCase {
  constructor(
    @Inject(MEDICAL_CERTIFICATE_REPOSITORY_TOKEN)
    private readonly repository: IMedicalCertificateRepository,
  ) {}

  async execute(
    file: Express.Multer.File,
    dto: UploadCertificateDto,
    userId: string,
    tenantId: string,
  ) {
    // 1. Faz upload do arquivo para S3
    const uploadResult = await this.repository.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // 2. Salva o certificado com status PENDING
    const certificate = await this.repository.save({
      userId,
      tenantId,
      fileName: file.originalname,
      fileUrl: uploadResult.fileUrl,
      s3Key: uploadResult.s3Key,
      mimeType: file.mimetype,
      fileSize: file.size,
      analysisStatus: AnalysisStatus.PENDING,
      observations: dto.observations,
      title: dto.title,
    });

    // 3. Dispara análise assíncrona com Bedrock (não bloqueia a resposta)
    this.repository.analyzeAsync(certificate.id, file.buffer, file.mimetype);

    return certificate;
  }
}
