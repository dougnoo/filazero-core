import { MedicalApprovalRequest } from '../../../domain/entities/medical-approval-request.entity';
import { MedicalApprovalRequestItemDto } from './list-medical-approval-requests-response.dto';

export class ListMedicalApprovalRequestsMapper {
  static toResponseDto(
    request: MedicalApprovalRequest,
  ): MedicalApprovalRequestItemDto {
    const date = new Date(request.createdAt);
    const formattedDate = date.toLocaleDateString('pt-BR');

    return {
      id: request.id,
      patientName: request.patientName,
      chiefComplaint: request.chiefComplaint,
      date: formattedDate,
      status: request.status,
      urgencyLevel: request.urgencyLevel,
      createdAt: date.toISOString(),
    };
  }
}
