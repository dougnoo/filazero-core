import { ApiProperty } from '@nestjs/swagger';
import { DependentTypeFormatter } from 'src/modules/user-management/domain/utils/dependent-type.formatter';

export class GetBeneficiaryDependentDto {
  @ApiProperty({ example: 'uuid-beneficiary-id' })
  id: string;

  @ApiProperty({ example: 'João Silva Junior' })
  name: string;

  @ApiProperty({ example: '12345678901', nullable: true })
  cpf: string | null;

  @ApiProperty({ example: '2010-01-15' })
  birthDate: Date;

  @ApiProperty({ example: 'joao.junior@example.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: '11999999999', nullable: true })
  phone: string | null;

  @ApiProperty({ example: 'M', nullable: true, description: 'M ou F' })
  gender: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({
    example: '123456-1',
    nullable: true,
    description: 'Matrícula do dependente',
  })
  memberId: string | null;

  @ApiProperty({
    example: 'Filho/Filha',
    description: 'Tipo do dependente',
  })
  type: string;

  constructor(
    id: string,
    name: string,
    cpf: string | null,
    birthDate: Date,
    email: string | null,
    phone: string | null,
    gender: string | null,
    isActive: boolean,
    memberId: string | null,
    dependentType: string,
  ) {
    this.id = id;
    this.name = name;
    this.cpf = cpf;
    this.birthDate = birthDate;
    this.email = email;
    this.phone = phone;
    this.gender = gender;
    this.isActive = isActive;
    this.memberId = memberId;
    this.type = dependentType;
  }
}
