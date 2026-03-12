import { Injectable, Inject } from '@nestjs/common';
import type { IBeneficiaryIntegrationRepository } from '../../domain/interfaces/beneficiary-integration.interface';
import { BENEFICIARY_INTEGRATION_REPOSITORY_TOKEN } from '../../domain/interfaces/beneficiary-integration.interface';

@Injectable()
export class GetBeneficiaryFileUseCase {
  constructor(
    @Inject(BENEFICIARY_INTEGRATION_REPOSITORY_TOKEN)
    private readonly repository: IBeneficiaryIntegrationRepository,
  ) {}

  async execute(
    fileId: string,
    beneficiaryId: string,
  ): Promise<{ url: string; fileName: string }> {
    return await this.repository.getBeneficiaryFile(fileId, beneficiaryId);
  }
}
