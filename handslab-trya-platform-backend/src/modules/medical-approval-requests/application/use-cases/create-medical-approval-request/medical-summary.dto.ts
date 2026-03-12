import { IsString, IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UrgencyLevel } from '../../../domain/enums/urgency-level.enum';

export class MedicalSummaryDto {
  @ApiProperty({
    description: 'AI-generated summary of the patient conversation',
    example:
      'Paciente relata dor de cabeça intensa há 3 dias, acompanhada de febre e náusea. Sintomas pioraram nas últimas 24 horas.',
  })
  @IsString()
  @IsNotEmpty()
  conversation_summary: string;

  @ApiProperty({
    description: 'Main symptoms identified by AI',
    example: ['dor de cabeça intensa', 'febre alta', 'náusea'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  main_symptoms: string[];

  @ApiProperty({
    description: 'Primary complaint or reason for consultation',
    example: 'Dor de cabeça intensa e persistente',
  })
  @IsString()
  @IsNotEmpty()
  chief_complaint: string;

  @ApiProperty({
    description: 'Exams suggested by AI based on symptoms',
    example: ['Hemograma completo', 'Tomografia de crânio'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  suggested_exams: string[];

  @ApiProperty({
    description: 'Urgency level classification (Manchester Triage System)',
    enum: UrgencyLevel,
    example: UrgencyLevel.URGENT,
  })
  @IsEnum(UrgencyLevel)
  urgency_level: UrgencyLevel;

  @ApiProperty({
    description: 'AI recommendation for care level',
    example:
      'Recomenda-se atendimento urgente devido à intensidade dos sintomas',
  })
  @IsString()
  @IsNotEmpty()
  care_recommendation: string;

  @ApiProperty({
    description: 'Basic care instructions for the patient',
    example: [
      'Manter hidratação adequada',
      'Repouso em ambiente tranquilo',
      'Evitar exposição à luz intensa',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  basic_care_instructions: string[];
}
