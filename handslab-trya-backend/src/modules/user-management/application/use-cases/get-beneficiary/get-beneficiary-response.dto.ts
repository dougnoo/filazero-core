import { ApiProperty } from '@nestjs/swagger';
import { DependentTypeFormatter } from 'src/modules/user-management/domain/utils/dependent-type.formatter';
import { GetBeneficiaryDependentDto } from './get-beneficiary-dependent.dto';

export class GetBeneficiaryResponseDto {
  @ApiProperty({ example: 'uuid-beneficiary-id' })
  id: string;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: '12345678900', nullable: true })
  cpf: string | null;

  @ApiProperty({ example: '1990-01-15' })
  birthDate: Date;

  @ApiProperty({ example: 'joao@example.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: '11999999999', nullable: true })
  phone: string | null;

  @ApiProperty({ example: 'uuid-tenant-id', nullable: true })
  tenantId: string | null;

  @ApiProperty({ example: 'Hospital Demo', nullable: true })
  tenantName: string | null;

  @ApiProperty({ example: 'uuid-plan-id', nullable: true })
  planId: string | null;

  @ApiProperty({ example: 'Plano Ouro', nullable: true })
  planName: string | null;

  @ApiProperty({ example: 'Unimed', nullable: true })
  operatorName: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 'M', nullable: true, description: 'M ou F' })
  gender: string | null;

  @ApiProperty({
    example: '123456',
    nullable: true,
    description: 'Matrícula do beneficiário',
  })
  memberId: string | null;

  @ApiProperty({
    example: 'Titular',
    description:
      'Tipo do beneficiário. Se titular retorna "Titular", se dependente retorna "TipoDependente de NomeBeneficiario"',
    nullable: true,
  })
  type: string | null;

  @ApiProperty({
    type: [GetBeneficiaryDependentDto],
    description: 'Lista de dependentes (apenas se o beneficiário é titular)',
    nullable: true,
  })
  dependents?: GetBeneficiaryDependentDto[] | null;

  constructor(
    id: string,
    name: string,
    cpf: string | null,
    birthDate: Date,
    email: string | null,
    phone: string | null,
    tenantId: string | null,
    tenantName: string | null,
    planId: string | null,
    planName: string | null,
    operatorName: string | null,
    isActive: boolean,
    gender: string | null,
    memberId: string | null,
    dependentType: string | null,
    dependents?: GetBeneficiaryDependentDto[] | null,
  ) {
    this.id = id;
    this.name = name;
    this.cpf = cpf;
    this.birthDate = birthDate;
    this.email = email;
    this.phone = phone;
    this.tenantId = tenantId;
    this.tenantName = tenantName;
    this.planId = planId;
    this.planName = planName;
    this.operatorName = operatorName;
    this.isActive = isActive;
    this.gender = gender;
    this.memberId = memberId;
    this.type = dependentType;
    this.dependents = dependents || null;
  }
}
