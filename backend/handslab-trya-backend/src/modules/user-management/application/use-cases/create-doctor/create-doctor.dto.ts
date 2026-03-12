import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty({
    description: 'Email do novo usuário médico',
    example: 'dr.silva@clinica.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Nome completo do médico',
    example: 'Dr. João Silva',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({
    description: 'Número de telefone do médico',
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
    description: 'CRM (Conselho Regional de Medicina)',
    example: '123456-SP',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'CRM deve ser uma string' })
  crm?: string;

  @ApiProperty({
    description: 'Especialidade médica',
    example: 'Cardiologia',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Especialidade deve ser uma string' })
  specialty?: string;
}
