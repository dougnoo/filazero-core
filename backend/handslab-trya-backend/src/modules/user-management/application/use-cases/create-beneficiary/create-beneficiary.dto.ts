import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsCPF } from '../../../../../shared/validators/is-cpf.validator';
import { DependentType } from '../../../../../shared/domain/enums/dependent-type.enum';
import { Gender } from '../../../../../shared/domain/enums/gender.enum';

export class CreateBeneficiaryDto {
  @ApiProperty({
    description: 'Nome completo do beneficiário',
    example: 'João Silva',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({
    description: 'CPF do beneficiário (com ou sem formatação)',
    example: '123.456.789-00',
  })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @IsString({ message: 'CPF deve ser uma string' })
  @IsCPF({ message: 'CPF inválido' })
  cpf: string;

  @ApiProperty({
    description: 'Data de nascimento do beneficiário',
    example: '1990-01-15',
  })
  @IsNotEmpty({ message: 'Data de nascimento é obrigatória' })
  @IsDateString(
    {},
    {
      message:
        'Data de nascimento deve ser uma data válida (formato: YYYY-MM-DD)',
    },
  )
  birthDate: string;

  @ApiProperty({
    description: 'ID do tenant (empresa)',
    example: 'broken-company-id',
  })
  @IsString({ message: 'Tenant ID deve ser uma string' })
  @IsNotEmpty({ message: 'Tenant ID é obrigatório' })
  tenantId: string;

  @ApiProperty({
    description: 'ID do plano',
    example: 'plan-id',
  })
  @IsString({ message: 'Plan ID deve ser uma string' })
  @IsNotEmpty({ message: 'Plan ID é obrigatório' })
  planId: string;

  @ApiProperty({
    description: 'Gênero do beneficiário',
    enum: Gender,
    example: Gender.F,
    required: true,
  })
  @IsEnum(Gender, { message: 'Gênero deve ser M ou F' })
  @IsNotEmpty({ message: 'Gênero é obrigatório' })
  gender: Gender;

  @ApiProperty({
    description: 'Matrícula do beneficiário',
    example: '123456',
    required: true,
  })  
  @IsString({ message: 'Matrícula deve ser uma string' })
  @IsNotEmpty({ message: 'Matrícula é obrigatória' })
  memberId: string;

  @ApiProperty({
    description: 'Tipo de beneficiário',
    enum: DependentType,
    example: DependentType.SELF,
    required: true,
  })  
  @IsEnum(DependentType, {
    message: 'Tipo de beneficiário deve ser SELF, SPOUSE, CHILD ou STEPCHILD',
  })
  beneficiaryType: DependentType;
}
