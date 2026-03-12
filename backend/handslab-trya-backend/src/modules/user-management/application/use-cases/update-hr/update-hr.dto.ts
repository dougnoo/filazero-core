import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { IsCPF } from '../../../../../shared/validators/is-cpf.validator';

export class UpdateHrDto {
  @ApiPropertyOptional({ description: 'Nome completo', example: 'João Silva' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'CPF', example: '12345678901' })
  @IsOptional()
  @IsCPF()
  cpf?: string;

  @ApiPropertyOptional({
    description: 'Data de nascimento',
    example: '1990-01-15',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'joao@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Telefone', example: '+5511999999999' })
  @IsOptional()
  @IsString()
  phone?: string;
}
