import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MedicalDocumentType } from '../../../../database/entities/medical-document.entity';

export enum DocumentStatusFilter {
  VALID = 'VALID',
  EXPIRED = 'EXPIRED',
}

export class ListDocumentsQueryDto {
  @ApiProperty({
    description: 'ID do membro da família para filtrar os documentos',
    example: 'uuid-member-id',
  })
  @IsUUID()
  memberUserId: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de documento',
    enum: MedicalDocumentType,
  })
  @IsOptional()
  @IsEnum(MedicalDocumentType)
  type?: MedicalDocumentType;

  @ApiPropertyOptional({
    description: 'Filtrar por status do documento',
    enum: DocumentStatusFilter,
  })
  @IsOptional()
  @IsEnum(DocumentStatusFilter)
  status?: DocumentStatusFilter;

  @ApiPropertyOptional({
    description: 'Buscar por título ou categoria',
    example: 'hemograma',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Data de emissão inicial (formato YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  issueDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Data de emissão final (formato YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  issueDateTo?: string;

  @ApiPropertyOptional({
    description: 'Número da página',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de itens por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
