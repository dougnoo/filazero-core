import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignedDoctorDto {
  @ApiProperty({ description: 'Nome do médico', example: 'Dr. Carlos Silva' })
  name: string;

  @ApiPropertyOptional({
    description: 'Código do conselho (ex: CRM, CRO)',
    example: 'CRM',
  })
  boardCode?: string;

  @ApiPropertyOptional({ description: 'Número do registro', example: '12345' })
  boardNumber?: string;

  @ApiPropertyOptional({ description: 'UF do registro', example: 'SP' })
  boardState?: string;
}

export class TriageValidationStatusResponseDto {
  @ApiProperty({ description: 'Se há validação em andamento', example: true })
  hasValidation: boolean;

  @ApiPropertyOptional({
    description: 'Status atual da validação',
    enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'ADJUSTED'],
    example: 'IN_REVIEW',
  })
  status?: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'ADJUSTED';

  @ApiPropertyOptional({
    description: 'Dados do médico responsável',
    type: AssignedDoctorDto,
  })
  assignedDoctor?: AssignedDoctorDto;

  @ApiPropertyOptional({
    description: 'Data de criação da solicitação',
    example: '2024-12-30T10:00:00Z',
  })
  createdAt?: string;

  @ApiPropertyOptional({
    description: 'Data de atualização da solicitação',
    example: '2024-12-30T10:30:00Z',
  })
  updatedAt?: string;
}
