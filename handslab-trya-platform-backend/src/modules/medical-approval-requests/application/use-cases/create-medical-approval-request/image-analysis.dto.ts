import { IsString, IsInt, IsISO8601, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImageAnalysisDto {
  @ApiProperty({
    description: 'Timestamp when images were analyzed',
    example: '2024-12-06T14:25:00Z',
  })
  @IsISO8601()
  timestamp: string;

  @ApiProperty({
    description: 'Number of images analyzed',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  num_images: number;

  @ApiProperty({
    description: 'Context or question asked about the images (optional)',
    example: 'Paciente enviou fotos de exame de sangue',
    required: false,
  })
  @IsString()
  @IsOptional()
  context?: string;

  @ApiProperty({
    description: 'Patient response or description of images',
    example: 'Estes são os resultados do meu hemograma de ontem',
  })
  @IsString()
  user_response: string;

  @ApiProperty({
    description: 'AI-generated detailed analysis of the images',
    example:
      'Hemograma apresenta leucocitose discreta com desvio à esquerda, sugerindo processo infeccioso. Demais parâmetros dentro da normalidade.',
  })
  @IsString()
  detailed_analysis: string;
}
