import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MedicationItemDto {
  @ApiProperty({
    description: 'ID da medicação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'ID da medicação deve ser um UUID válido' })
  medicationId!: string;

  @ApiPropertyOptional({
    description: 'Dosagem da medicação',
    example: '500mg, 2x ao dia',
  })
  @IsOptional()
  @IsString()
  dosage?: string;
}

export class SaveOnboardDto {
  @ApiPropertyOptional({
    description: 'Lista de IDs de condições crônicas',
    type: [String],
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, {
    each: true,
    message: 'Cada ID de condição crônica deve ser um UUID válido',
  })
  chronicConditionIds?: string[];

  @ApiPropertyOptional({
    description: 'Lista de medicações com dosagem',
    type: [MedicationItemDto],
    example: [
      {
        medicationId: '123e4567-e89b-12d3-a456-426614174000',
        dosage: '500mg, 2x ao dia',
      },
      {
        medicationId: '223e4567-e89b-12d3-a456-426614174001',
        dosage: '10mg, 1x ao dia',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationItemDto)
  medications?: MedicationItemDto[];

  @ApiPropertyOptional({
    description: 'Lista de alergias (texto livre)',
    example: 'Penicilina, Amoxicilina, Dipirona',
  })
  @IsOptional()
  @IsString()
  allergies?: string;
}
