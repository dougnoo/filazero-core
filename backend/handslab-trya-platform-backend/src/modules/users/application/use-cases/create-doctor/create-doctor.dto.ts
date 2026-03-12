import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../../../../shared/domain/enums/gender.enum';
import { BoardCode } from '../../../../../shared/domain/enums/board-code.enum';

export class CreateDoctorDto {
  @ApiProperty({
    description: 'Doctor email address',
    example: 'doctor@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Doctor full name',
    example: 'Dr. John Smith',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Medical specialty',
    example: 'Cardiology',
  })
  @IsString()
  @IsNotEmpty()
  specialty: string;

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
  @IsNotEmpty()
  boardNumber: string;

  @ApiProperty({
    description: 'Board state (UF)',
    example: 'SP',
  })
  @IsString()
  @Length(2, 2)
  boardState: string;

  @ApiProperty({
    description: 'Phone number in E.164 format',
    example: '+5511999999999',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in valid E.164 format',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Gender',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiPropertyOptional({
    description:
      'Optional temporary password. If not provided, one will be generated',
    example: 'TempPass123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  temporaryPassword?: string;
}
