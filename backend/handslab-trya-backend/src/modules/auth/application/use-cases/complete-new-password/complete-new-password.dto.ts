import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  Matches,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteNewPasswordDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'doctor@hospital1.com',
    type: String,
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    description:
      'Nova senha (mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial)',
    example: 'NewPassword123!',
    minLength: 8,
    type: String,
  })
  @IsString({ message: 'Nova senha deve ser uma string' })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(8, { message: 'Nova senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Nova senha deve conter: letra maiúscula, minúscula, número e caractere especial',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Session retornada no erro de NEW_PASSWORD_REQUIRED do login',
    example: 'AYABeD...',
    type: String,
  })
  @IsString({ message: 'Session é obrigatória' })
  @IsNotEmpty({ message: 'Session é obrigatória' })
  session: string;

  @ApiProperty({
    description: 'Código OTP de 6 dígitos recebido por email',
    example: '123456',
    minLength: 6,
    maxLength: 6,
    type: String,
  })
  @IsString({ message: 'Código OTP deve ser uma string' })
  @IsNotEmpty({ message: 'Código OTP é obrigatório' })
  @Length(6, 6, { message: 'Código OTP deve ter exatamente 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'Código OTP deve conter apenas números' })
  otpCode: string;

  @ApiPropertyOptional({
    description: 'ID do tenant (organização)',
    example: 'hospital1-uuid',
    type: String,
  })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
