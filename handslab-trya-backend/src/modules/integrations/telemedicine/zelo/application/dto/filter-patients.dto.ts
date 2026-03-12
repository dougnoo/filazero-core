import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterPatientsDto {
  // Dados pessoais
  @ApiPropertyOptional({ description: 'Filtrar por nome (busca parcial)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filtrar por email (busca parcial)' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Filtrar por CPF' })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiPropertyOptional({ description: 'Filtrar por telefone' })
  @IsOptional()
  @IsString()
  phone?: string;

  // Status
  @ApiPropertyOptional({
    description: 'Filtrar por status',
    enum: ['ACTIVE', 'INACTIVE'],
  })
  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE';

  @ApiPropertyOptional({ description: 'Filtrar por status online' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_online?: boolean;

  // Datas
  @ApiPropertyOptional({
    description: 'Data de nascimento mínima (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  birth_date_min?: string;

  @ApiPropertyOptional({
    description: 'Data de nascimento máxima (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  birth_date_max?: string;

  @ApiPropertyOptional({ description: 'Data de adesão do plano mínima' })
  @IsOptional()
  @IsString()
  plan_adherence_date_min?: string;

  @ApiPropertyOptional({ description: 'Data de adesão do plano máxima' })
  @IsOptional()
  @IsString()
  plan_adherence_date_max?: string;

  @ApiPropertyOptional({ description: 'Data de expiração do plano mínima' })
  @IsOptional()
  @IsString()
  plan_expiry_date_min?: string;

  @ApiPropertyOptional({ description: 'Data de expiração do plano máxima' })
  @IsOptional()
  @IsString()
  plan_expiry_date_max?: string;

  @ApiPropertyOptional({ description: 'Data de convite mínima' })
  @IsOptional()
  @IsString()
  invited_at_min?: string;

  @ApiPropertyOptional({ description: 'Data de convite máxima' })
  @IsOptional()
  @IsString()
  invited_at_max?: string;

  // Titular/Dependente
  @ApiPropertyOptional({ description: 'Filtrar por ID do titular' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  holder_id?: number;

  @ApiPropertyOptional({ description: 'Filtrar se é titular ou dependente' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_holder?: boolean;

  // Endereço
  @ApiPropertyOptional({ description: 'Filtrar por rua' })
  @IsOptional()
  @IsString()
  address__street?: string;

  @ApiPropertyOptional({ description: 'Filtrar por cidade' })
  @IsOptional()
  @IsString()
  address__city?: string;

  @ApiPropertyOptional({ description: 'Filtrar por estado' })
  @IsOptional()
  @IsString()
  address__state?: string;

  @ApiPropertyOptional({ description: 'Filtrar por CEP' })
  @IsOptional()
  @IsString()
  address__zip_code?: string;

  // Plano
  @ApiPropertyOptional({ description: 'Filtrar por número da carteirinha' })
  @IsOptional()
  @IsString()
  insurance_card_number?: string;

  @ApiPropertyOptional({ description: 'Filtrar por código do plano' })
  @IsOptional()
  @IsString()
  insurance_plan_code?: string;

  // Paginação
  @ApiPropertyOptional({
    description: 'Número da página',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Tamanho da página',
    minimum: 1,
    maximum: 50,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  page_size?: number;

  // Campos dinâmicos (extra_fields)
  [key: string]: any;
}
