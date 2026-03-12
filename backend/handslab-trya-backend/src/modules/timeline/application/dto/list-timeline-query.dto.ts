import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  TimelineEventType,
  TimelineEventCategory,
} from '../../../../database/entities/timeline-event.entity';

export class ListTimelineQueryDto {
  @ApiPropertyOptional({
    description: 'ID do membro da família para filtrar eventos. Se não informado, lista do titular e seus dependentes',
    example: 'uuid-member-id',
  })
  @IsOptional()
  @IsUUID()
  memberUserId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de evento',
    enum: TimelineEventType,
  })
  @IsOptional()
  @IsEnum(TimelineEventType)
  eventType?: TimelineEventType;

  @ApiPropertyOptional({
    description: 'Filtrar por categoria',
    enum: TimelineEventCategory,
  })
  @IsOptional()
  @IsEnum(TimelineEventCategory)
  category?: TimelineEventCategory;

  @ApiPropertyOptional({
    description: 'Data inicial (formato YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Data final (formato YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

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
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
