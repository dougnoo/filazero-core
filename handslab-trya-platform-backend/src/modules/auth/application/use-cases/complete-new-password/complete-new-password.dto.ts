import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteNewPasswordDto {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Session token from NEW_PASSWORD_REQUIRED challenge',
    example: 'AYABeD...',
  })
  @IsString()
  @IsNotEmpty()
  session: string;

  @ApiProperty({
    description: 'Código OTP de 6 dígitos enviado por email',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewSecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
