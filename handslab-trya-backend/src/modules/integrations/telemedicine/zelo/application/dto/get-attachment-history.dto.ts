import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AttachmentFileType,
  AttachmentOrigin,
} from '../../domain/ZeloAttachment.entity';

/**
 * DTO para buscar histórico de anexos de um paciente
 */
export class GetAttachmentHistoryDto {
  @ApiProperty({
    description: 'CPF do paciente',
    example: '12345678901',
    required: true,
  })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @IsString()
  @Matches(/^\d{11}$/, {
    message: 'CPF deve conter exatamente 11 dígitos numéricos',
  })
  cpf: string;

  @ApiPropertyOptional({
    description: 'Filtra anexos por código da consulta',
    example: 'ABC1234567',
  })
  @IsOptional()
  @IsString()
  consultation_code?: string;

  @ApiPropertyOptional({
    description: 'Filtra anexos por tipo de arquivo',
    enum: AttachmentFileType,
    example: AttachmentFileType.PRESCRIPTION,
  })
  @IsOptional()
  @IsEnum(AttachmentFileType, {
    message: 'Tipo de arquivo deve ser um valor válido',
  })
  file_type?: AttachmentFileType;

  @ApiPropertyOptional({
    description: 'Filtra anexos por origem',
    enum: AttachmentOrigin,
    example: AttachmentOrigin.DOCTOR,
  })
  @IsOptional()
  @IsEnum(AttachmentOrigin, {
    message: 'Origem deve ser um valor válido',
  })
  origin?: AttachmentOrigin;

  @ApiPropertyOptional({
    description: 'Filtra anexos criados em >= valor (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Data deve estar no formato YYYY-MM-DD',
  })
  created_at_min?: string;

  @ApiPropertyOptional({
    description: 'Filtra anexos criados em <= valor (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Data deve estar no formato YYYY-MM-DD',
  })
  created_at_max?: string;

  @ApiPropertyOptional({
    description: 'Número da página a ser retornada',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Número da página deve ser no mínimo 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Número de resultados por página (máximo 50)',
    example: 50,
    default: 50,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Tamanho da página deve ser no mínimo 1' })
  @Max(50, { message: 'Tamanho da página não pode exceder 50' })
  page_size?: number = 50;
}
