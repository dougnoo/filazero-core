import { Injectable, Inject, Logger } from '@nestjs/common';
import { MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN } from '../../../domain/repositories/medical-approval-request.repository.token';
import type { IMedicalApprovalRequestRepository } from '../../../domain/repositories/medical-approval-request.repository.interface';
import { USER_DB_REPOSITORY_TOKEN } from '../../../../users/domain/repositories/user-db.repository.token';
import type { IUserDbRepository } from '../../../../users/domain/repositories/user-db.repository.interface';
import { BENEFICIARY_INTEGRATION_REPOSITORY_TOKEN } from '../../../domain/repositories/beneficiary-integration.repository.token';
import type { IBeneficiaryIntegrationRepository } from '../../../domain/repositories/beneficiary-integration.repository.interface';
import { COMPANY_REPOSITORY_TOKEN } from '../../../../companies/domain/repositories/company.repository.token';
import type { ICompanyRepository } from '../../../../companies/domain/repositories/company.repository.interface';
import { PrescriptionRepository } from '../../../../prescriptions/domain/repositories/prescription.repository';
import { MedicalApprovalRequest } from '../../../domain/entities/medical-approval-request.entity';
import { ApproveMedicalApprovalRequestDto } from './approve-medical-approval-request.dto';
import { ApproveMedicalApprovalRequestResponseDto } from './approve-medical-approval-request-response.dto';
import { MedicalApprovalRequestNotFoundError } from '../../../domain/errors/medical-approval-request-not-found.error';
import { UnauthorizedApprovalError } from '../../../domain/errors/unauthorized-approval.error';
import { InvalidStatusTransitionError } from '../../../domain/errors/invalid-status-transition.error';
import { DoctorNotFoundError } from '../../../../users/domain/errors/doctor-not-found.error';
import { ApprovalStatus } from '../../../domain/enums/approval-status.enum';

@Injectable()
export class ApproveMedicalApprovalRequestUseCase {
  private readonly logger = new Logger(
    ApproveMedicalApprovalRequestUseCase.name,
  );

  constructor(
    @Inject(MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN)
    private readonly repository: IMedicalApprovalRequestRepository,
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(BENEFICIARY_INTEGRATION_REPOSITORY_TOKEN)
    private readonly beneficiaryIntegrationRepository: IBeneficiaryIntegrationRepository,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepository: ICompanyRepository,
    private readonly prescriptionRepository: PrescriptionRepository,
  ) {}

  async execute(
    requestId: string,
    doctorCognitoId: string,
    dto: ApproveMedicalApprovalRequestDto,
  ): Promise<ApproveMedicalApprovalRequestResponseDto> {
    // Find doctor by Cognito ID to get internal user ID
    const doctor = await this.userDbRepository.findByCognitoId(doctorCognitoId);
    if (!doctor) {
      throw new DoctorNotFoundError(doctorCognitoId);
    }

    // Find the medical approval request
    const request = await this.repository.findById(requestId);
    if (!request) {
      throw new MedicalApprovalRequestNotFoundError(requestId);
    }

    // Verify that the doctor is authorized to approve this request
    // Compare internal user IDs
    if (request.assignedDoctorId !== doctor.id) {
      throw new UnauthorizedApprovalError(
        doctor.id,
        request.assignedDoctorId || 'none',
      );
    }

    // Validate status transition
    this.validateStatusTransition(request.status, dto.status);

    // Update the request using the reconstitute method
    const updatedRequest = MedicalApprovalRequest.reconstitute({
      ...request,
      status: dto.status,
      doctorNotes: dto.doctorNotes || request.doctorNotes,
      updatedAt: new Date(),
    });

    // Save the updated request
    const savedRequest = await this.repository.save(updatedRequest);

    // Send notification if status is APPROVED or ADJUSTED
    if (
      dto.status === ApprovalStatus.APPROVED ||
      dto.status === ApprovalStatus.ADJUSTED
    ) {
      await this.sendTriageFinishedNotification(savedRequest, doctor.name);
    }

    return {
      id: savedRequest.id,
      status: savedRequest.status,
      doctorNotes: savedRequest.doctorNotes,
      updatedAt: savedRequest.updatedAt.toISOString(),
    };
  }

  private validateStatusTransition(
    currentStatus: ApprovalStatus,
    newStatus: ApprovalStatus,
  ): void {
    const validTransitions: Record<ApprovalStatus, ApprovalStatus[]> = {
      [ApprovalStatus.PENDING]: [ApprovalStatus.IN_REVIEW],
      [ApprovalStatus.IN_REVIEW]: [
        ApprovalStatus.APPROVED,
        ApprovalStatus.ADJUSTED,
      ],
      [ApprovalStatus.APPROVED]: [], // Final state
      [ApprovalStatus.ADJUSTED]: [], // Final state
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new InvalidStatusTransitionError(currentStatus, newStatus);
    }
  }

  private async sendTriageFinishedNotification(
    request: MedicalApprovalRequest,
    doctorName: string,
  ): Promise<void> {
    try {
      // Get company baseUrl from tenant
      const company = await this.companyRepository.findByTenantId(
        request.tenantId,
      );

      if (!company || !company.baseUrl) {
        this.logger.warn(
          `Company baseUrl not found for tenant ${request.tenantId}, skipping notification`,
        );
        return;
      }

      const attachments: Array<{
        name: string;
        filename: string;
        link: string;
        size: string;
        extension: string;
      }> = [];

      // Try to get prescription PDF if exists
      try {
        const prescription = await this.prescriptionRepository.findBySessionId(
          request.sessionId,
        );

        if (prescription?.pdfUrl) {
          attachments.push({
            name: 'Receita Médica',
            filename: `receita_${request.sessionId}.pdf`,
            link: prescription.pdfUrl,
            size: '',
            extension: 'pdf',
          });
        }
      } catch (error) {
        this.logger.warn(
          `Failed to fetch prescription for session ${request.sessionId}`,
          error,
        );
        // Continue without prescription attachment
      }

      await this.beneficiaryIntegrationRepository.sendTriageFinishedNotification(
        company.baseUrl,
        {
          category: 'TRIAGE_FINISHED',
          data: {
            sessionId: request.sessionId,
            doctorName,
            attachments,
          },
        },
      );

      this.logger.log(
        `Notification sent for session ${request.sessionId} with ${attachments.length} attachment(s)`,
      );
    } catch (error) {
      // Don't block the response if notification fails
      this.logger.error(
        `Failed to send notification for session ${request.sessionId}`,
        error,
      );
    }
  }
}
