import {
  IsUUID,
  IsEnum,
  IsString,
  IsOptional,
  IsNumber,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoardCode } from '../../../../../shared/domain/enums/board-code.enum';

export class SyncPrescriptorDto {
  @ApiProperty({
    description: 'Doctor user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  doctorId: string;

  @ApiProperty({
    description: 'Medical board code',
    enum: BoardCode,
    example: BoardCode.CRM,
  })
  @IsEnum(BoardCode)
  boardCode: BoardCode;

  @ApiProperty({
    description: 'Board registration number',
    example: '123456',
  })
  @IsString()
  boardNumber: string;

  @ApiProperty({
    description: 'Board state (UF)',
    example: 'SP',
  })
  @IsString()
  @Length(2, 2)
  boardState: string;

  @ApiPropertyOptional({
    description: 'Memed city ID (optional)',
    example: 1234,
  })
  @IsOptional()
  @IsNumber()
  cityId?: number;

  @ApiPropertyOptional({
    description: 'Memed specialty ID (optional)',
    example: 5678,
  })
  @IsOptional()
  @IsNumber()
  specialtyId?: number;
}
