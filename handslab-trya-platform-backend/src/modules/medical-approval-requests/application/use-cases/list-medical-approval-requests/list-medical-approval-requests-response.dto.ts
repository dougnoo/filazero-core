import { ApiProperty } from '@nestjs/swagger';
import { ApprovalStatus } from '../../../domain/enums/approval-status.enum';
import { UrgencyLevel } from 'src/modules/medical-approval-requests/domain/enums/urgency-level.enum';

export class MedicalApprovalRequestItemDto {
  @ApiProperty({
    description: 'Request unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Patient full name',
    example: 'João da Silva',
  })
  patientName: string;

  @ApiProperty({
    description: 'Chief complaint (main reason for consultation)',
    example: 'Febre que começou de madrugada',
  })
  chiefComplaint: string;

  @ApiProperty({
    description: 'Request creation date (DD/MM/YYYY)',
    example: '03/12/2025',
  })
  date: string;

  @ApiProperty({
    description: 'Current approval status',
    enum: ApprovalStatus,
    example: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @ApiProperty({
    description: 'Urgency level',
    example: UrgencyLevel.URGENT,
  })
  urgencyLevel: UrgencyLevel;

  @ApiProperty({
    description: 'Request creation date and time (ISO 8601)',
    example: '2025-12-03T14:32:00.000Z',
    format: 'date-time',
  })
  createdAt: string;
}

export class PaginationMetadata {
  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;
}

export class ListMedicalApprovalRequestsResponseDto {
  @ApiProperty({
    description: 'Array of medical approval requests',
    type: [MedicalApprovalRequestItemDto],
  })
  data: MedicalApprovalRequestItemDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetadata,
  })
  pagination: PaginationMetadata;
}
