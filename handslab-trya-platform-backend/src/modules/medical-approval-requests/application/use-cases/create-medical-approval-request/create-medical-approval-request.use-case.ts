import { Injectable, Inject } from '@nestjs/common';
import type { IMedicalApprovalRequestRepository } from '../../../domain/repositories/medical-approval-request.repository.interface';
import { MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN } from '../../../domain/repositories/medical-approval-request.repository.token';
import { SessionAlreadyExistsError } from '../../../domain/errors/session-already-exists.error';
import { CreateMedicalApprovalRequestDto } from './create-medical-approval-request.dto';
import { CreateMedicalApprovalRequestResponseDto } from './create-medical-approval-request-response.dto';
import { CreateMedicalApprovalRequestMapper } from './create-medical-approval-request.mapper';

@Injectable()
export class CreateMedicalApprovalRequestUseCase {
  constructor(
    @Inject(MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN)
    private readonly repository: IMedicalApprovalRequestRepository,
  ) {}

  async execute(
    dto: CreateMedicalApprovalRequestDto,
  ): Promise<CreateMedicalApprovalRequestResponseDto> {
    // Check session_id uniqueness
    const existingRequest = await this.repository.findBySessionId(
      dto.session_id,
    );

    if (existingRequest) {
      throw new SessionAlreadyExistsError(dto.session_id);
    }

    // Map DTO to domain entity
    const medicalApprovalRequest =
      CreateMedicalApprovalRequestMapper.toDomain(dto);

    // Persist the entity
    const createdRequest = await this.repository.create(medicalApprovalRequest);

    // Map to response DTO
    return CreateMedicalApprovalRequestMapper.toResponseDto(createdRequest);
  }
}
