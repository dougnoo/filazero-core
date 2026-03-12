import { Injectable, Inject } from '@nestjs/common';
import type { IMedicalApprovalRequestRepository } from '../../../domain/repositories/medical-approval-request.repository.interface';
import { MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN } from '../../../domain/repositories/medical-approval-request.repository.token';
import { USER_DB_REPOSITORY_TOKEN } from '../../../../users/domain/repositories/user-db.repository.token';
import type { IUserDbRepository } from '../../../../users/domain/repositories/user-db.repository.interface';
import { MedicalApprovalRequestNotFoundError } from '../../../domain/errors/medical-approval-request-not-found.error';
import { InvalidStatusTransitionError } from '../../../domain/errors/invalid-status-transition.error';
import { DoctorNotFoundError } from '../../../../users/domain/errors/doctor-not-found.error';
import { ApprovalStatus } from '../../../domain/enums/approval-status.enum';
import { AssignMedicalApprovalRequestResponseDto } from './assign-medical-approval-request-response.dto';

@Injectable()
export class AssignMedicalApprovalRequestUseCase {
  constructor(
    @Inject(MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN)
    private readonly repository: IMedicalApprovalRequestRepository,
    @Inject(USER_DB_REPOSITORY_TOKEN)
    private readonly userDbRepository: IUserDbRepository,
  ) {}

  async execute(
    requestId: string,
    doctorCognitoId: string,
  ): Promise<AssignMedicalApprovalRequestResponseDto> {
    // Retrieve doctor by Cognito ID
    const doctor = await this.userDbRepository.findByCognitoId(doctorCognitoId);

    if (!doctor) {
      throw new DoctorNotFoundError(doctorCognitoId);
    }

    // Retrieve request by ID
    const request = await this.repository.findById(requestId);

    if (!request) {
      throw new MedicalApprovalRequestNotFoundError(requestId);
    }

    // Validate current status is PENDING
    if (request.status !== ApprovalStatus.PENDING) {
      throw new InvalidStatusTransitionError(
        request.status,
        ApprovalStatus.IN_REVIEW,
      );
    }

    // Update assigned_doctor_id and status
    request.assignedDoctorId = doctor.id;
    request.status = ApprovalStatus.IN_REVIEW;
    request.updatedAt = new Date();

    // Save updated request
    const updatedRequest = await this.repository.save(request);

    // Return response DTO
    return {
      id: updatedRequest.id,
      status: updatedRequest.status,
      assigned_doctor: {
        id: updatedRequest.assignedDoctorId!,
      },
      updated_at: updatedRequest.updatedAt.toISOString(),
    };
  }
}
