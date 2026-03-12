import { Injectable, Inject } from '@nestjs/common';
import type { IMedicalApprovalRequestRepository } from '../../../domain/repositories/medical-approval-request.repository.interface';
import { MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN } from '../../../domain/repositories/medical-approval-request.repository.token';
import { GetPatientHistoryResponseDto } from './get-patient-history-response.dto';

@Injectable()
export class GetPatientHistoryUseCase {
  constructor(
    @Inject(MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN)
    private readonly medicalApprovalRequestRepository: IMedicalApprovalRequestRepository,
  ) {}

  async execute(patientId: string): Promise<GetPatientHistoryResponseDto> {
    // Get all medical approval requests for this patient
    const result =
      await this.medicalApprovalRequestRepository.findByPatientId(patientId);

    // Map to simple response with only essential data
    const history = result.map((request) => ({
      id: request.id,
      sessionId: request.sessionId,
      chiefComplaint: request.chiefComplaint,
      createdAt: request.createdAt.toISOString(),
    }));

    return {
      history,
    };
  }
}
