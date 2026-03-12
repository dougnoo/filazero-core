import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsISO8601,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PatientDataDto } from './patient-data.dto';

export class CreateMedicalApprovalRequestDto {
  @ApiProperty({
    description: 'Unique session identifier from trya-backend',
    example: 'local-session-user-5',
  })
  @IsString()
  @IsNotEmpty()
  session_id: string;

  @ApiProperty({
    description: 'Patient data including symptoms, exams, and medical summary',
    type: () => PatientDataDto,
  })
  @ValidateNested()
  @Type(() => PatientDataDto)
  patient_data: PatientDataDto;

  @ApiProperty({
    description: 'Patient full name (duplicated for convenience)',
    example: 'João da Silva',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  patient_name: string;

  @ApiProperty({
    description: 'User/beneficiary identifier',
    example: 'user-5',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'Tenant/company identifier',
    example: 'tenant-123',
  })
  @IsString()
  @IsNotEmpty()
  tenant_id: string;

  @ApiProperty({
    description: 'Timestamp of last update in ISO 8601 format',
    example: '2025-12-03T13:12:27.632227',
  })
  @IsISO8601()
  updated_at: string;
}
