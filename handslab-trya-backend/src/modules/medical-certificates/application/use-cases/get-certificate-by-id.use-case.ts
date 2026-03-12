import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IMedicalCertificateRepository } from '../../domain/interfaces/medical-certificate.repository.interface';
import { MEDICAL_CERTIFICATE_REPOSITORY_TOKEN } from '../../domain/interfaces/medical-certificate.repository.interface';

@Injectable()
export class GetCertificateByIdUseCase {
  constructor(
    @Inject(MEDICAL_CERTIFICATE_REPOSITORY_TOKEN)
    private readonly repository: IMedicalCertificateRepository,
  ) {}

  async execute(id: string, userId: string, tenantId: string) {
    const certificate = await this.repository.findById(id, tenantId);

    if (!certificate || certificate.userId !== userId) {
      throw new NotFoundException('Atestado não encontrado');
    }

    const presignedUrl = await this.repository.generatePresignedUrl(
      certificate.s3Key,
      300,
    );

    // Beneficiários não devem ver os resultados da análise de IA
    // Apenas informações básicas do arquivo e status
    return {
      id: certificate.id,
      fileName: certificate.fileName,
      fileUrl: presignedUrl,
      mimeType: certificate.mimeType,
      fileSize: certificate.fileSize,
      status: certificate.status,
      analysisStatus: certificate.analysisStatus,
      observations: certificate.observations,
      createdAt: certificate.createdAt,
      updatedAt: certificate.updatedAt,
      title: certificate.title,
    };
  }
}
