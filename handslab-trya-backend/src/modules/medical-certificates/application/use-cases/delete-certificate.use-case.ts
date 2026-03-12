import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IMedicalCertificateRepository } from '../../domain/interfaces/medical-certificate.repository.interface';
import { MEDICAL_CERTIFICATE_REPOSITORY_TOKEN } from '../../domain/interfaces/medical-certificate.repository.interface';

@Injectable()
export class DeleteCertificateUseCase {
  constructor(
    @Inject(MEDICAL_CERTIFICATE_REPOSITORY_TOKEN)
    private readonly repository: IMedicalCertificateRepository,
  ) {}

  async execute(certificateId: string, userId: string, tenantId: string) {
    const certificate = await this.repository.findById(certificateId, tenantId);

    if (!certificate) {
      throw new NotFoundException('Atestado não encontrado');
    }

    if (certificate.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar este atestado',
      );
    }

    await this.repository.delete(certificateId, tenantId);
  }
}
