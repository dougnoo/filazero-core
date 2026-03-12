import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IMedicalCertificateRepository } from '../../domain/interfaces/medical-certificate.repository.interface';
import { MEDICAL_CERTIFICATE_REPOSITORY_TOKEN } from '../../domain/interfaces/medical-certificate.repository.interface';

@Injectable()
export class GetCertificateByIdHRUseCase {
  constructor(
    @Inject(MEDICAL_CERTIFICATE_REPOSITORY_TOKEN)
    private readonly repository: IMedicalCertificateRepository,
  ) {}

  async execute(id: string, tenantId: string) {
    const certificate = await this.repository.findByIdWithRelations(
      id,
      tenantId,
    );

    if (!certificate) {
      throw new NotFoundException('Atestado não encontrado');
    }

    const presignedUrl = await this.repository.generatePresignedUrl(
      certificate.s3Key,
      900,
    );

    return {
      id: certificate.id,
      fileName: certificate.fileName,
      fileUrl: presignedUrl,
      mimeType: certificate.mimeType,
      fileSize: certificate.fileSize,
      status: certificate.status,
      analysisStatus: certificate.analysisStatus,
      confidenceScore: certificate.confidenceScore,
      aiConclusion: certificate.aiConclusion,
      observations: certificate.observations,
      validations: {
        crm: {
          result: certificate.crmValidation,
          observation: certificate.crmObservation,
        },
        authenticity: {
          result: certificate.authenticityValidation,
          observation: certificate.authenticityObservation,
        },
        signature: {
          result: certificate.signatureValidation,
          observation: certificate.signatureObservation,
        },
        date: {
          result: certificate.dateValidation,
          observation: certificate.dateObservation,
        },
        legibility: {
          result: certificate.legibilityValidation,
          observation: certificate.legibilityObservation,
        },
        clinic: {
          result: certificate.clinicValidation,
          observation: certificate.clinicObservation,
        },
        fraud: {
          result: certificate.fraudValidation,
          observation: certificate.fraudObservation,
        },
      },
      beneficiary: {
        name: certificate.user?.name,
        cpf: certificate.user?.cpf,
        tenantName: certificate.user?.tenant?.name,
        planName: certificate.user?.userPlans?.[0]?.plan?.name,
      },
      analyzedAt: certificate.analyzedAt,
      createdAt: certificate.createdAt,
      updatedAt: certificate.updatedAt,
    };
  }
}
