import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadCertificateDto {
  @ApiPropertyOptional({
    description: 'Observações sobre o atestado',
    example: 'Atestado referente a consulta de rotina',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observations?: string;

  @ApiProperty({
    description: 'Título do atestado',
    example: 'Atestado Médico - Consulta de Rotina',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;
}
