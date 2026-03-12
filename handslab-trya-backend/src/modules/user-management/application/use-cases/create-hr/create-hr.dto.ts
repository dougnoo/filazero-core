import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHrDto {
  @ApiProperty({
    description: 'Email do novo usuário do RH',
    example: 'rh@broken.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Nome completo do usuário do RH',
    example: 'Maria Santos',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({
    description: 'CPF do usuário do RH (com ou sem formatação)',
    example: '123.456.789-00',
  })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @IsString({ message: 'CPF deve ser uma string' })
  cpf: string;

  @ApiProperty({
    description: 'Data de nascimento do usuário do RH',
    example: '1990-01-15',
  })
  @IsNotEmpty({ message: 'Data de nascimento é obrigatória' })
  @IsDateString(
    {},
    {
      message:
        'Data de nascimento deve ser uma data válida (formato: YYYY-MM-DD)',
    },
  )
  birthDate: string;

  @ApiProperty({
    description:
      'ID do tenant (empresa) - Obrigatório apenas para SUPER_ADMIN e ADMIN',
    example: 'broken-company-id',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Tenant ID deve ser uma string' })
  tenantId?: string;

  @ApiProperty({
    description: 'Número de telefone do usuário do RH',
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
}
