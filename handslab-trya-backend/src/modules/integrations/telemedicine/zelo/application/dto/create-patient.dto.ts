import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AddressDto {
  @ApiPropertyOptional({ example: 'Rua Exemplo' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: '123' })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({ example: 'Centro' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({ example: 'São Paulo' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '01234-567' })
  @IsOptional()
  @IsString()
  zip_code?: string;
}

export class CreatePatientDto {
  @ApiProperty({
    description: 'Nome completo do paciente',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'CPF do paciente (com ou sem formatação)',
    example: '123.456.789-00',
  })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiPropertyOptional({
    description: 'E-mail do paciente',
    example: 'joao@email.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Data de nascimento (formato: YYYY-MM-DD)',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsString()
  birth_date?: string;

  @ApiPropertyOptional({
    description: 'Telefone do paciente (apenas números)',
    example: '11999999999',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Número da carteirinha do plano',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  insurance_card_number?: string;

  @ApiPropertyOptional({
    description: 'Código do plano de saúde',
    example: 'PLANO001',
  })
  @IsOptional()
  @IsString()
  insurance_plan_code?: string;

  @ApiPropertyOptional({
    description: 'Data de adesão ao plano (formato: YYYY-MM-DD)',
    example: '2023-01-01',
  })
  @IsOptional()
  @IsString()
  plan_adherence_date?: string;

  @ApiPropertyOptional({
    description: 'Data de expiração do plano (formato: YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  plan_expiry_date?: string;

  @ApiPropertyOptional({
    description: 'Campos customizados adicionais',
    example: { custom_field_1: 'valor1', custom_field_2: 'valor2' },
  })
  @IsOptional()
  extra_fields?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Endereço do paciente',
    type: AddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
