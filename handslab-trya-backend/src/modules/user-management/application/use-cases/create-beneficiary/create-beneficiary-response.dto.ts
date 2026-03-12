import { ApiProperty } from '@nestjs/swagger';

export class CreateBeneficiaryResponseDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: 'us-east-1:12345678-1234-1234-1234-123456789012',
  })
  id: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'beneficiario@broken.com',
  })
  email?: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'ID do usuário que criou o beneficiário',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  createdBy?: string;
}
