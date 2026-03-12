import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Email do novo admin',
    example: 'admin@broken.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Nome completo do admin',
    example: 'João Silva',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({
    description: 'ID do tenant (empresa)',
    example: 'broken-company-id',
  })
  @IsString({ message: 'Tenant ID deve ser uma string' })
  @IsNotEmpty({ message: 'Tenant ID é obrigatório' })
  tenantId: string;

  @ApiProperty({
    description: 'Número de telefone do admin',
    example: '+5511999999999',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Número de telefone deve ser uma string' })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Senha temporária para o primeiro login',
    example: 'TempPass123!',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Senha temporária deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  temporaryPassword?: string;

  @ApiProperty({
    description: 'CPf do admin',
    example: '123.456.789-00',
    required: true,
  })
  @IsString({ message: 'CPF deve ser uma string' })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  cpf: string;
}
