import {
  IsInt,
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ApprovalStatus } from '../../../domain/enums/approval-status.enum';
import { UrgencyLevel } from '../../../domain/enums/urgency-level.enum';
import { OrderBy } from '../../../domain/enums/order-by.enum';
import { OrderDirection } from '../../../domain/enums/order-direction.enum';

export class ListMedicalApprovalRequestsDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by approval status',
    example: ApprovalStatus.PENDING,
    enum: ApprovalStatus,
  })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @ApiPropertyOptional({
    description: 'Filter by urgency level',
    example: UrgencyLevel.STANDARD,
    enum: UrgencyLevel,
  })
  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgencyLevel?: UrgencyLevel;

  @ApiPropertyOptional({
    description: 'Search by patient name',
    example: 'João',
  })
  @IsOptional()
  @IsString()
  patientName?: string;

  @ApiPropertyOptional({
    description: 'Filter by creation date (YYYY-MM-DD)',
    example: '2025-12-03',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Order by field',
    example: OrderBy.URGENCY_AND_TIME,
    enum: OrderBy,
    default: OrderBy.URGENCY_AND_TIME,
  })
  @IsOptional()
  @IsEnum(OrderBy)
  orderBy?: OrderBy;

  @ApiPropertyOptional({
    description: 'Order direction',
    example: OrderDirection.DESC,
    enum: OrderDirection,
    default: OrderDirection.DESC,
  })
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
}
