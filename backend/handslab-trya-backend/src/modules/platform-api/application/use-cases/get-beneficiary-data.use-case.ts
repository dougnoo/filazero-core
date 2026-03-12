import { Injectable, Inject } from '@nestjs/common';
import type { IBeneficiaryIntegrationRepository } from '../../domain/interfaces/beneficiary-integration.interface';
import { BENEFICIARY_INTEGRATION_REPOSITORY_TOKEN } from '../../domain/interfaces/beneficiary-integration.interface';
import { BeneficiaryDataDto } from '../../domain/dtos/beneficiary-data.dto';

@Injectable()
export class GetBeneficiaryDataUseCase {
  constructor(
    @Inject(BENEFICIARY_INTEGRATION_REPOSITORY_TOKEN)
    private readonly repository: IBeneficiaryIntegrationRepository,
  ) {}

  async execute(beneficiaryId: string): Promise<BeneficiaryDataDto> {
    const beneficiaryData =
      await this.repository.getBeneficiaryData(beneficiaryId);

    // CPF is returned complete - anonymization happens on frontend

    const date = new Date(beneficiaryData.birthDate).toLocaleDateString(
      'pt-BR',
    );
    beneficiaryData.birthDate = date as any;

    if (beneficiaryData.phone) {
      const phone = beneficiaryData.phone.replace(/^\+55/, '');
      beneficiaryData.phone = phone.replace(
        /^(\d{2})(\d{5})(\d{4})$/,
        '($1) $2-$3',
      );
    }

    return beneficiaryData;
  }
}
