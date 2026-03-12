import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type BoardCode =
  | 'CRM'
  | 'CRO'
  | 'COREN'
  | 'CRMV'
  | 'CRF'
  | 'CRN'
  | 'CREFITO'
  | 'CRP'
  | 'CRFa'
  | 'CREF';

export class CreatePrescriptorDto {
  @ApiProperty({
    description: 'ID do médico (doctor) no nosso sistema',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  doctorId: string;

  @ApiProperty({
    description: 'ID do tenant',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  tenantId: string;

  @ApiProperty({
    description: 'Código do conselho profissional',
    enum: [
      'CRM',
      'CRO',
      'COREN',
      'CRMV',
      'CRF',
      'CRN',
      'CREFITO',
      'CRP',
      'CRFa',
      'CREF',
    ],
    example: 'CRM',
  })
  @IsEnum([
    'CRM',
    'CRO',
    'COREN',
    'CRMV',
    'CRF',
    'CRN',
    'CREFITO',
    'CRP',
    'CRFa',
    'CREF',
  ])
  boardCode: BoardCode;

  @ApiProperty({
    description: 'Número do registro no conselho',
    example: '12345',
  })
  @IsString()
  boardNumber: string;

  @ApiProperty({
    description: 'UF do conselho (2 letras)',
    example: 'SP',
  })
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'boardState must be 2 uppercase letters' })
  boardState: string;

  @ApiPropertyOptional({
    description: 'CPF do médico (somente números)',
    example: '12345678900',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF must be 11 digits' })
  cpf?: string;

  @ApiPropertyOptional({
    description: 'Email do médico',
    example: 'medico@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Telefone do médico',
    example: '11999887766',
  })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional({
    description: 'Sexo do médico',
    enum: ['M', 'F'],
    example: 'M',
  })
  @IsOptional()
  @IsEnum(['M', 'F'])
  sexo?: 'M' | 'F';

  @ApiPropertyOptional({
    description: 'Data de nascimento (dd/mm/YYYY)',
    example: '15/08/1985',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'dataNascimento must be in format dd/mm/YYYY',
  })
  dataNascimento?: string;

  @ApiPropertyOptional({
    description: 'ID da cidade na Memed',
    example: 5403,
  })
  @IsOptional()
  cidadeId?: number;

  @ApiPropertyOptional({
    description: 'ID da especialidade na Memed',
    example: 101,
  })
  @IsOptional()
  especialidadeId?: number;
}
