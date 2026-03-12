import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email do usuário que esqueceu a senha',
    example: 'usuario@exemplo.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Nome/slug do tenant (para branding do email)',
    example: 'grupotrigo',
  })
  @IsOptional()
  @IsString()
  tenantName?: string;
}
