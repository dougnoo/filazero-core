import { ApiProperty } from '@nestjs/swagger';

export class ClaimImportStatsDto {
  @ApiProperty({ description: 'Total de linhas processadas' })
  totalRows: number;

  @ApiProperty({ description: 'Claims importados com sucesso' })
  importedClaims: number;

  @ApiProperty({ description: 'Claims com provider matched' })
  matchedClaims: number;

  @ApiProperty({ description: 'Claims sem match (provider não encontrado)' })
  unmatchedClaims: number;

  @ApiProperty({ description: 'Linhas com erro' })
  errorRows: number;

  @ApiProperty({ description: 'Confidence médio dos matches', example: 95.5 })
  avgMatchConfidence: number;

  @ApiProperty({
    description: 'Distribuição de métodos de matching',
    example: { exact: 100, fuzzy: 50, none: 20 },
  })
  matchMethodDistribution: {
    exact: number;
    fuzzy: number;
    manual: number;
    none: number;
  };
}

export class ClaimImportResponseDto {
  @ApiProperty({ description: 'ID do batch de importação' })
  batchId: string;

  @ApiProperty({ description: 'Timestamp da importação' })
  importedAt: Date;

  @ApiProperty({ type: ClaimImportStatsDto })
  stats: ClaimImportStatsDto;

  @ApiProperty({
    description: 'Erros encontrados durante importação',
    type: [String],
  })
  errors: string[];

  @ApiProperty({
    description: 'Providers não encontrados (top 20)',
    type: [String],
  })
  unmatchedProviders: string[];

  @ApiProperty({ description: 'Tempo de processamento em segundos' })
  processingTimeSeconds: number;
}

export class ClaimsSummaryDto {
  @ApiProperty({ description: 'Total de claims no sistema' })
  totalClaims: number;

  @ApiProperty({ description: 'Total de providers com claims' })
  providersWithClaims: number;

  @ApiProperty({ description: 'Valor total de claims' })
  totalClaimValue: number;

  @ApiProperty({ description: 'Data do claim mais recente' })
  lastClaimDate: Date;

  @ApiProperty({ description: 'Top 10 especialidades' })
  topSpecialties: Array<{ specialty: string; count: number }>;

  @ApiProperty({ description: 'Top 10 providers por volume' })
  topProviders: Array<{
    providerId: string;
    providerName: string;
    claimCount: number;
  }>;
}

export class ProviderWithMetricsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  claimCount?: number;

  @ApiProperty({ required: false })
  avgClaimValue?: number;

  @ApiProperty({ required: false })
  specialtyCounts?: { [key: string]: number };

  @ApiProperty({ required: false })
  lastClaimDate?: Date;

  @ApiProperty({ required: false })
  distance?: number;

  @ApiProperty({
    description: 'Se a especialidade filtrada tem histórico de claims',
    required: false,
  })
  hasSpecialtyMatch?: boolean;
}
