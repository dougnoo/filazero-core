import {
  IsOptional,
  IsString,
  Matches,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BoardCode } from '../../../../../shared/domain/enums/board-code.enum';

export class UpdateDoctorDto {
  @ApiPropertyOptional({
    description: 'Doctor full name',
    example: 'Dr. John Smith',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional({
    description: 'Phone number in E.164 format',
    example: '+5511999999999',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in valid E.164 format',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Medical board code',
    example: 'CRM',
    enum: BoardCode,
  })
  @IsOptional()
  @IsEnum(BoardCode)
  boardCode?: BoardCode;

  @ApiPropertyOptional({
    description: 'Medical board number',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  boardNumber?: string;

  @ApiPropertyOptional({
    description: 'Medical board state',
    example: 'SP',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, {
    message: 'Board state must be a valid 2-letter state code',
  })
  boardState?: string;

  @ApiPropertyOptional({
    description: 'Medical specialty',
    example: 'Cardiology',
  })
  @IsOptional()
  @IsString()
  specialty?: string;
}
