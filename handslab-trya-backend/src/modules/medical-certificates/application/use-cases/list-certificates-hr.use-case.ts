import { Inject, Injectable } from '@nestjs/common';
import type {
  IMedicalCertificateRepository,
  SearchFilters,
} from '../../domain/interfaces/medical-certificate.repository.interface';
import { MEDICAL_CERTIFICATE_REPOSITORY_TOKEN } from '../../domain/interfaces/medical-certificate.repository.interface';

@Injectable()
export class ListCertificatesHRUseCase {
  constructor(
    @Inject(MEDICAL_CERTIFICATE_REPOSITORY_TOKEN)
    private readonly repository: IMedicalCertificateRepository,
  ) {}

  async execute(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    filters?: SearchFilters,
  ) {
    const result = await this.repository.findByTenantId(
      tenantId,
      page,
      limit,
      filters,
    );

    const dataWithPresignedUrls = await Promise.all(
      result.data.map(async (cert) => ({
        id: cert.id,
        fileName: cert.fileName,
        fileUrl: await this.repository.generatePresignedUrl(cert.s3Key, 900),
        status: cert.status,
        analysisStatus: cert.analysisStatus,
        confidenceScore: cert.confidenceScore,
        aiConclusion: cert.aiConclusion,
        observations: cert.observations,
        crmValidation: cert.crmValidation,
        authenticityValidation: cert.authenticityValidation,
        signatureValidation: cert.signatureValidation,
        dateValidation: cert.dateValidation,
        legibilityValidation: cert.legibilityValidation,
        beneficiaryName: cert.user?.name,
        beneficiaryCpf: cert.user?.cpf,
        tenantName: cert.user?.tenant?.name,
        planName: cert.user?.userPlans?.[0]?.plan?.name,
        createdAt: cert.createdAt,
      })),
    );

    return {
      ...result,
      data: dataWithPresignedUrls,
    };
  }
}
