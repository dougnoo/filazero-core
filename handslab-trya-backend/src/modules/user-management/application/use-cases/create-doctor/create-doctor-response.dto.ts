import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorResponseDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: 'us-east-1:12345678-1234-1234-1234-123456789012',
  })
  id: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'dr.silva@clinica.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nome completo do médico',
    example: 'Dr. João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'CRM (Conselho Regional de Medicina)',
    example: '123456-SP',
    required: false,
  })
  crm?: string;

  @ApiProperty({
    description: 'Especialidade médica',
    example: 'Cardiologia',
    required: false,
  })
  specialty?: string;
}
