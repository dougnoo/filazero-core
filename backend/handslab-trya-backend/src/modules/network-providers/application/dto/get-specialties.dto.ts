import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GetSpecialtiesDto {
  @ApiProperty({
    description: 'UF do estado',
    example: 'DF',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Nome da cidade',
    example: 'BRASILIA',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({
    description: 'Nome do bairro (opcional)',
    example: 'ASA SUL',
  })
  @IsString()
  @IsOptional()
  neighborhood?: string;

  @ApiPropertyOptional({
    description: 'Categoria (opcional)',
    example: 'OFTALMOLOGIA',
  })
  @IsString()
  @IsOptional()
  category?: string;
}
