import { Inject, Injectable } from '@nestjs/common';
import type {
  IMedicalCertificateRepository,
  SearchFilters,
} from '../../domain/interfaces/medical-certificate.repository.interface';
import { MEDICAL_CERTIFICATE_REPOSITORY_TOKEN } from '../../domain/interfaces/medical-certificate.repository.interface';

@Injectable()
export class ListCertificatesUseCase {
  constructor(
    @Inject(MEDICAL_CERTIFICATE_REPOSITORY_TOKEN)
    private readonly repository: IMedicalCertificateRepository,
  ) {}

  async execute(
    userId: string,
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    filters?: SearchFilters,
  ) {
    const result = await this.repository.findByUserId(
      userId,
      tenantId,
      page,
      limit,
      filters,
    );

    const dataWithPresignedUrls = await Promise.all(
      result.data.map(async (cert) => ({
        id: cert.id,
        fileName: cert.fileName,
        fileUrl: await this.repository.generatePresignedUrl(cert.s3Key, 300), // 5 minutos
        status: cert.status,
        observations: cert.observations,
        createdAt: cert.createdAt,
      })),
    );

    return {
      ...result,
      data: dataWithPresignedUrls,
    };
  }
}
