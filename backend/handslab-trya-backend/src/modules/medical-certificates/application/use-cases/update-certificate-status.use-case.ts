import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IMedicalCertificateRepository } from '../../domain/interfaces/medical-certificate.repository.interface';
import { MEDICAL_CERTIFICATE_REPOSITORY_TOKEN } from '../../domain/interfaces/medical-certificate.repository.interface';
import { CertificateStatus } from '../../../../database/entities/medical-certificate.entity';

@Injectable()
export class UpdateCertificateStatusUseCase {
  constructor(
    @Inject(MEDICAL_CERTIFICATE_REPOSITORY_TOKEN)
    private readonly repository: IMedicalCertificateRepository,
  ) {}

  async execute(id: string, tenantId: string, status: CertificateStatus) {
    const certificate = await this.repository.findById(id, tenantId);

    if (!certificate) {
      throw new NotFoundException('Atestado não encontrado');
    }

    const updatedCertificate = await this.repository.update(id, tenantId, {
      status,
    });

    return {
      id: updatedCertificate.id,
      fileName: updatedCertificate.fileName,
      status: updatedCertificate.status,
      updatedAt: updatedCertificate.updatedAt,
    };
  }
}
