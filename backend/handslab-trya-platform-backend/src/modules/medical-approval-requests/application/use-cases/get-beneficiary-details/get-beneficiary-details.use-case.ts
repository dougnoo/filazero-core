import {
  Injectable,
  Inject,
  NotFoundException,
  BadGatewayException,
} from '@nestjs/common';
import { MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN } from '../../../domain/repositories/medical-approval-request.repository.token';
import type { IMedicalApprovalRequestRepository } from '../../../domain/repositories/medical-approval-request.repository.interface';
import { COMPANY_REPOSITORY_TOKEN } from '../../../../companies/domain/repositories/company.repository.token';
import type { ICompanyRepository } from '../../../../companies/domain/repositories/company.repository.interface';
import { BENEFICIARY_INTEGRATION_REPOSITORY_TOKEN } from '../../../domain/repositories/beneficiary-integration.repository.token';
import type { IBeneficiaryIntegrationRepository } from '../../../domain/repositories/beneficiary-integration.repository.interface';
import { GetBeneficiaryDetailsResponseDto } from './get-beneficiary-details-response.dto';

@Injectable()
export class GetBeneficiaryDetailsUseCase {
  constructor(
    @Inject(MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN)
    private readonly medicalApprovalRequestRepository: IMedicalApprovalRequestRepository,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepository: ICompanyRepository,
    @Inject(BENEFICIARY_INTEGRATION_REPOSITORY_TOKEN)
    private readonly beneficiaryIntegrationRepository: IBeneficiaryIntegrationRepository,
  ) {}

  async execute(requestId: string): Promise<GetBeneficiaryDetailsResponseDto> {
    try {
      const request =
        await this.medicalApprovalRequestRepository.findById(requestId);
      if (!request) {
        throw new NotFoundException(
          `Medical approval request ${requestId} not found`,
        );
      }

      const company = await this.companyRepository.findByTenantId(
        request.tenantId,
      );
      if (!company || !company.baseUrl) {
        throw new NotFoundException(
          `Company for tenant ${request.tenantId} not found`,
        );
      }

      return await this.beneficiaryIntegrationRepository.getBeneficiaryDetails(
        company.baseUrl,
        request.userId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadGatewayException('Failed to retrieve beneficiary details');
    }
  }
}
