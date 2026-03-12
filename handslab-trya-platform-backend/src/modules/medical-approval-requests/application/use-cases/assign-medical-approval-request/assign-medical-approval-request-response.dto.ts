import { ApiProperty } from '@nestjs/swagger';

export class AssignedDoctorDto {
  @ApiProperty({
    description: 'Doctor ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;
}

export class AssignMedicalApprovalRequestResponseDto {
  @ApiProperty({
    description: 'Medical approval request ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Updated status',
    example: 'IN_REVIEW',
    enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'ADJUSTED'],
  })
  status: string;

  @ApiProperty({
    description: 'Assigned doctor information',
    type: AssignedDoctorDto,
  })
  assigned_doctor: AssignedDoctorDto;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-06-12T11:00:00.000Z',
  })
  updated_at: string;
}
