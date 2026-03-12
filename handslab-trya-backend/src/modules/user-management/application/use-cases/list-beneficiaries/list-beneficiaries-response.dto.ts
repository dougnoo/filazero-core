import { ApiProperty } from '@nestjs/swagger';
import { DependentTypeFormatter } from 'src/modules/user-management/domain/utils/dependent-type.formatter';

export class ListBeneficiariesResponseDto {
  @ApiProperty({
    description: 'ID do beneficiário',
    example: 'uuid-do-beneficiario',
  })
  id: string;

  @ApiProperty({ description: 'Nome do beneficiário', example: 'João Silva' })
  name: string;

  @ApiProperty({
    description: 'CPF do beneficiário',
    example: '12345678901',
    nullable: true,
  })
  cpf: string | null;

  @ApiProperty({
    description: 'Email do beneficiário',
    example: 'joao@example.com',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: 'Se o beneficiário está ativo (tem conta no Cognito)',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description:
      'Tipo do beneficiário. Se for titular, retorna "Titular". Se for dependente, retorna "TipoDependente NomeBeneficiario" (ex: "Cônjuge João Silva")',
    example: 'Titular',
  })
  type: string;

  constructor(
    id: string,
    name: string,
    cpf: string | null,
    email: string | null,
    active: boolean,
    dependentType: string | null,
    principalName?: string,
  ) {
    this.id = id;
    this.name = name;
    this.cpf = cpf;
    this.email = email;
    this.active = active;
    this.type = DependentTypeFormatter.format(dependentType, principalName);
  }
}
