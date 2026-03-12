import { BeneficiaryDataDto } from '../dtos/beneficiary-data.dto';

export interface IBeneficiaryIntegrationRepository {
  getBeneficiaryData(beneficiaryId: string): Promise<BeneficiaryDataDto>;
  getBeneficiaryFile(
    fileId: string,
    beneficiaryId: string,
  ): Promise<{ url: string; fileName: string }>;
}

export const BENEFICIARY_INTEGRATION_REPOSITORY_TOKEN =
  'BENEFICIARY_INTEGRATION_REPOSITORY_TOKEN';
