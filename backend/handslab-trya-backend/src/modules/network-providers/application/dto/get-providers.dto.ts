import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetProvidersDto {
  @ApiProperty({ description: 'UF do estado', example: 'DF' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Nome da cidade', example: 'BRASILIA' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({
    description: 'Categoria (opcional)',
    example: 'CONSULTORIOS - CLINICAS - TERAPIAS',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Especialidade (opcional)',
    example: 'NEUROLOGIA PEDIÁTRICA',
  })
  @IsString()
  @IsOptional()
  specialty?: string;

  @ApiPropertyOptional({
    description: 'Bairro (opcional)',
    example: 'ASA SUL',
  })
  @IsString()
  @IsOptional()
  neighborhood?: string;

  @ApiPropertyOptional({ description: 'Página', example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Limite por página', example: 50, default: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 50;
}
