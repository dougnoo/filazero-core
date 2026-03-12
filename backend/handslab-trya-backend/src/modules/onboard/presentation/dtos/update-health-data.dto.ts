import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateHealthDataDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId!: string;

  @ApiPropertyOptional({
    description: 'Lista de nomes de condições crônicas para adicionar',
    type: [String],
    example: ['Diabetes', 'Hipertensão'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chronicConditions?: string[];

  @ApiPropertyOptional({
    description: 'Lista de nomes de medicações para adicionar',
    type: [String],
    example: ['Metformina', 'Losartana'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @ApiPropertyOptional({
    description: 'Alergias (texto livre)',
    example: 'Penicilina, Amoxicilina',
  })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional({
    description:
      'Se true, adiciona aos dados existentes. Se false, sobrescreve.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  merge?: boolean;
}
