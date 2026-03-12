import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { IsCPF } from '../../../../../shared/validators/is-cpf.validator';
import { Gender } from '../../../../../shared/domain/enums/gender.enum';
import { DependentType } from '../../../../../shared/domain/enums/dependent-type.enum';

export class UpdateBeneficiaryDto {
  @ApiPropertyOptional({
    description: 'Nome completo do beneficiário',
    example: 'João Silva Santos',
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  name?: string;

  @ApiPropertyOptional({
    description: 'CPF do beneficiário (11 dígitos)',
    example: '12345678901',
  })
  @IsOptional()
  @IsCPF({ message: 'CPF inválido' })
  cpf?: string;

  @ApiPropertyOptional({
    description: 'Data de nascimento (YYYY-MM-DD)',
    example: '1990-01-15',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Data de nascimento deve estar no formato YYYY-MM-DD' },
  )
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'Email do beneficiário',
    example: 'joao@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Telefone do beneficiário',
    example: '11987654321',
  })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'ID da empresa (tenant) do beneficiário',
    example: 'uuid-do-tenant',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Tenant ID deve ser um UUID válido' })
  tenantId?: string;

  @ApiPropertyOptional({
    description: 'ID do plano de saúde',
    example: 'uuid-do-plano',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Plan ID deve ser um UUID válido' })
  planId?: string;

  @ApiPropertyOptional({
    description: 'Gênero do beneficiário',
    enum: Gender,
    example: Gender.M,
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'Gênero deve ser M ou F' })
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Matrícula do beneficiário',
    example: '123456-1',
  })
  @IsOptional()
  @IsString({ message: 'Matrícula deve ser uma string' })
  memberId?: string;

  @ApiPropertyOptional({
    description: 'Tipo do beneficiário (titular ou dependente)',
    enum: DependentType,
    example: DependentType.SELF,
  })
  @IsOptional()
  @IsEnum(DependentType, {
    message: 'Tipo deve ser SELF, SPOUSE, CHILD ou STEPCHILD',
  })
  dependentType?: DependentType;
}
