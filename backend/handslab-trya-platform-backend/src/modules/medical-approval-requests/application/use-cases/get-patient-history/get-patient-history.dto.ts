import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetPatientHistoryDto {
  @ApiProperty({
    description: 'Patient ID (user ID from the triage system)',
    example: 'user_123',
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;
}
