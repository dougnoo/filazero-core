import {
  ArrayMaxSize,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    description: 'Email ou CPF do usuário',
    example: 'doctor@hospital1.com ou 12345678900',
    type: String,
  })
  @IsString({ message: 'Email ou CPF deve ser uma string' })
  @IsNotEmpty({ message: 'Email ou CPF é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'Password123!',
    minLength: 8,
    type: String,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  password: string;

  @ApiPropertyOptional({
    description: 'ID do tenant (organização)',
    example: 'hospital1-uuid',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Tenant ID deve ser uma string' })
  tenantId?: string;

  @ApiPropertyOptional({
    description: 'Nome/subdomain do tenant (alternativa ao tenantId)',
    example: 'grupotrigo',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Tenant Name deve ser uma string' })
  tenantName?: string;

  @ApiPropertyOptional({
    description: 'IDs dos termos aceitos pelo usuário',
    example: ['term1-uuid', 'term2-uuid'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  @ArrayMaxSize(2, { message: 'Pode ter no máximo 2 itens' })
  termsAcceptedIds?: string[];
}
