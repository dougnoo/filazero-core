import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SearchProvidersDto {
  @ApiProperty({
    description: 'Código da rede do plano',
    example: '883',
  })
  @IsString()
  @IsNotEmpty()
  networkCode: string;

  @ApiProperty({
    description: 'Código do plano',
    example: '962934',
  })
  @IsString()
  @IsNotEmpty()
  planCode: string;

  @ApiProperty({
    description: 'UF do estado',
    example: 'CE',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Nome do município',
    example: 'Fortaleza',
  })
  @IsString()
  @IsNotEmpty()
  municipality: string;

  @ApiProperty({
    description: 'Tipo de serviço',
    example: 'EXAMES ESPECIAIS',
  })
  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @ApiProperty({
    description: 'Nome da especialidade',
    example:
      'ANGIO RESSONANCIA MAGNETICA ARTERIAL (INCLUI PULMONAR - ABDOMEN SUPERIOR - CRANIO - PELVE - PESCOCO)',
  })
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @ApiProperty({
    description: 'Nome do bairro (opcional)',
    example: 'ALVARO WEYNE',
    required: false,
  })
  @IsString()
  @IsOptional()
  neighborhood?: string;
}
