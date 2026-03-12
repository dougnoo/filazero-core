import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  ConsultationStatus,
  ConsultationType,
} from '../../domain/ZeloConsultation.entity';

/**
 * DTO para buscar histórico de consultas de um paciente
 */
export class GetConsultationHistoryDto {
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
    description: 'Filtra consultas pelo status',
    enum: ConsultationStatus,
    example: ConsultationStatus.FINISHED,
  })
  @IsOptional()
  @IsEnum(ConsultationStatus, {
    message: 'Status deve ser um valor válido',
  })
  status?: ConsultationStatus;

  @ApiPropertyOptional({
    description: 'Filtra consultas pelo tipo',
    enum: ConsultationType,
    example: ConsultationType.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(ConsultationType, {
    message: 'Tipo deve ser um valor válido',
  })
  type?: ConsultationType;

  @ApiPropertyOptional({
    description: 'Filtra consultas por CPF do médico',
    example: '98765432100',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, {
    message: 'CPF do médico deve conter exatamente 11 dígitos numéricos',
  })
  doctor_cpf?: string;

  @ApiPropertyOptional({
    description: 'Filtra consultas por nome da especialidade',
    example: 'Neurologia',
  })
  @IsOptional()
  @IsString()
  speciality_name?: string;

  @ApiPropertyOptional({
    description: 'Filtra consultas com data de início >= valor (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Data deve estar no formato YYYY-MM-DD',
  })
  start_date_min?: string;

  @ApiPropertyOptional({
    description: 'Filtra consultas com data de início <= valor (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Data deve estar no formato YYYY-MM-DD',
  })
  start_date_max?: string;

  @ApiPropertyOptional({
    description: 'Filtra consultas com data de fim >= valor (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Data deve estar no formato YYYY-MM-DD',
  })
  end_date_min?: string;

  @ApiPropertyOptional({
    description: 'Filtra consultas com data de fim <= valor (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Data deve estar no formato YYYY-MM-DD',
  })
  end_date_max?: string;

  @ApiPropertyOptional({
    description: 'Filtra consultas agendadas para >= valor (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Data deve estar no formato YYYY-MM-DD',
  })
  scheduled_for_min?: string;

  @ApiPropertyOptional({
    description: 'Filtra consultas agendadas para <= valor (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Data deve estar no formato YYYY-MM-DD',
  })
  scheduled_for_max?: string;

  @ApiPropertyOptional({
    description: 'Filtra consultas pagas',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  is_paid?: boolean;

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
