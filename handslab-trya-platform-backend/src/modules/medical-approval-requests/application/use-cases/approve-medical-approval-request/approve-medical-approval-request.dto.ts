import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalStatus } from '../../../domain/enums/approval-status.enum';

export class ApproveMedicalApprovalRequestDto {
  @ApiProperty({
    description: 'The approval status to set',
    enum: ApprovalStatus,
    example: ApprovalStatus.APPROVED,
    enumName: 'ApprovalStatus',
  })
  @IsEnum(ApprovalStatus)
  @IsNotEmpty()
  status: ApprovalStatus;

  @ApiPropertyOptional({
    description: 'Optional doctor notes for the approval/adjustment',
    example:
      'Patient should follow up in 2 weeks. Prescribed medication as discussed.',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  doctorNotes?: string;
}
