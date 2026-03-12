import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class SaveOnboardExternalDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId!: string;

  @ApiPropertyOptional({
    description: 'Lista de nomes de condições crônicas',
    type: [String],
    example: ['Diabetes', 'Hipertensão'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chronicConditions?: string[];

  @ApiPropertyOptional({
    description: 'Lista de nomes de medicações',
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
}
