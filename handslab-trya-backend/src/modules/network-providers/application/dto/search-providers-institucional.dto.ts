import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchProvidersInstitucionalDto {
  @ApiProperty({
    description: 'Código da rede do plano',
    example: '1098',
  })
  @IsString()
  @IsNotEmpty()
  networkCode: string;

  @ApiProperty({
    description: 'UF do estado',
    example: 'RJ',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Nome do município',
    example: 'RIO DE JANEIRO',
  })
  @IsString()
  @IsNotEmpty()
  municipality: string;

  @ApiProperty({
    description: 'Nome do bairro',
    example: 'TODOS OS BAIRROS',
  })
  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @ApiProperty({
    description: 'Especialidade',
    example: 'PRONTO SOCORRO ADULTO',
  })
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @ApiProperty({
    description: 'Tipo de serviço',
    example: 'PRONTO-SOCORRO 24H (URGENCIA E EMERGENCIA)',
  })
  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @ApiPropertyOptional({
    description: 'Operadora (padrão: AMIL)',
    example: 'AMIL',
  })
  @IsString()
  @IsOptional()
  operator?: string = 'AMIL';

  @ApiPropertyOptional({
    description: 'Modalidade (padrão: SAUDE)',
    example: 'SAUDE',
  })
  @IsString()
  @IsOptional()
  modality?: string = 'SAUDE';

  @ApiPropertyOptional({
    description: 'Contexto (padrão: AMIL)',
    example: 'AMIL',
  })
  @IsString()
  @IsOptional()
  context?: string = 'AMIL';
}
