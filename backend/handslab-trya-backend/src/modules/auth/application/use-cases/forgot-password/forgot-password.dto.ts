import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email do usuário que deseja redefinir a senha',
    example: 'usuario@exemplo.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'ID do tenant (opcional para multi-tenancy)',
    example: 'tenant-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiProperty({
    description: 'Nome/slug do tenant (para branding do email)',
    example: 'grupotrigo',
    required: false,
  })
  @IsOptional()
  @IsString()
  tenantName?: string;
}
