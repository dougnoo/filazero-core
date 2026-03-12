import { ApiProperty } from '@nestjs/swagger';
import { ApprovalStatus } from '../../../domain/enums/approval-status.enum';

export class ApproveMedicalApprovalRequestResponseDto {
  @ApiProperty({
    description: 'The ID of the medical approval request',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Updated status',
    example: ApprovalStatus.APPROVED,
    enum: ApprovalStatus,
  })
  status: ApprovalStatus;

  @ApiProperty({
    description: 'Doctor notes (if provided)',
    example:
      'Patient should follow up in 2 weeks. Prescribed medication as discussed.',
    required: false,
  })
  doctorNotes?: string;

  @ApiProperty({
    description: 'Timestamp when the request was updated',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: string;
}
