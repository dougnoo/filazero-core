import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { OtpType } from '../../../domain/value-objects/otp-type.enum';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Código OTP a ser verificado',
    example: '123456',
  })
  @IsString({ message: 'Código OTP deve ser uma string' })
  @IsNotEmpty({ message: 'Código OTP é obrigatório' })
  otpCode: string;

  @ApiProperty({
    description: 'Tipo esperado do OTP (opcional)',
    enum: OtpType,
    example: OtpType.FIRST_LOGIN,
    required: false,
  })
  @IsOptional()
  @IsEnum(OtpType, {
    message: 'Tipo de OTP deve ser FIRST_LOGIN ou PASSWORD_RESET',
  })
  expectedType?: OtpType;
}
