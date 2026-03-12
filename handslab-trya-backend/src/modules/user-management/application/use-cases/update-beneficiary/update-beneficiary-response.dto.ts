import { ApiProperty } from '@nestjs/swagger';

export class UpdateBeneficiaryResponseDto {
  @ApiProperty({
    description: 'ID do beneficiário',
    example: 'uuid-do-beneficiario',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do beneficiário',
    example: 'João Silva Santos',
  })
  name: string;

  @ApiProperty({ description: 'CPF do beneficiário', example: '12345678901' })
  cpf: string;

  @ApiProperty({ description: 'Data de nascimento', example: '1990-01-15' })
  birthDate: string;

  @ApiProperty({
    description: 'Email do beneficiário',
    example: 'joao@example.com',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: 'Telefone do beneficiário',
    example: '11987654321',
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    description: 'ID do tenant',
    example: 'uuid-do-tenant',
    nullable: true,
  })
  tenantId: string | null;

  @ApiProperty({
    description: 'ID do plano de saúde',
    example: 'uuid-do-plano',
    nullable: true,
  })
  planId: string | null;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    cpf: string,
    birthDate: string,
    email: string | null,
    phone: string | null,
    tenantId: string | null,
    planId: string | null,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.cpf = cpf;
    this.birthDate = birthDate;
    this.email = email;
    this.phone = phone;
    this.tenantId = tenantId;
    this.planId = planId;
    this.updatedAt = updatedAt;
  }
}
