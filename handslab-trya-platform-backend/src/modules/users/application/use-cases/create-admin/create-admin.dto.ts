import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../../../../shared/domain/enums/gender.enum';

export class CreateAdminDto {
  @ApiPropertyOptional({
    description:
      'Username for Cognito (cannot be email format). If not provided, Cognito will generate a UUID',
    example: 'admin_user',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Admin full name',
    example: 'John Smith',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

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
