import { ApiProperty } from '@nestjs/swagger';

export class FamilyDocumentStatisticsDto {
  @ApiProperty({ description: 'Total de documentos cadastrados' })
  registered!: number;

  @ApiProperty({ description: 'Total de documentos válidos' })
  valid!: number;

  @ApiProperty({ description: 'Total de documentos vencidos' })
  expired!: number;
}

export class FamilyDocumentCategoryDistributionDto {
  @ApiProperty({ description: 'Nome da categoria do documento' })
  name!: string;

  @ApiProperty({ description: 'Quantidade de documentos nesta categoria' })
  count!: number;
}

export class FamilyReminderDto {
  @ApiProperty({ description: 'ID do documento ou alerta' })
  id!: string;

  @ApiProperty({ description: 'Título do documento' })
  title!: string;

  @ApiProperty({ description: 'Nome do membro da família' })
  memberName!: string;

  @ApiProperty({ description: 'Tipo de documento' })
  type!: string;

  @ApiProperty({ description: 'Categoria do documento' })
  category!: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt!: string;

  @ApiProperty({
    description: 'Status do lembrete',
    enum: ['expired', 'expiring_soon'],
  })
  status!: 'expired' | 'expiring_soon';

  @ApiProperty({
    description: 'Indica se é um alerta de saúde (true) ou lembrete de documento (false)',
    default: false,
  })
  isAlert?: boolean;
}

export class FamilyDashboardResponseDto {
  @ApiProperty({
    type: FamilyDocumentStatisticsDto,
    description: 'Estatísticas de documentos',
  })
  documents!: FamilyDocumentStatisticsDto;

  @ApiProperty({
    type: [FamilyDocumentCategoryDistributionDto],
    description: 'Distribuição de documentos por categoria',
  })
  categoryDistribution!: FamilyDocumentCategoryDistributionDto[];

  @ApiProperty({
    type: [FamilyReminderDto],
    description: 'Lembretes de documentos vencidos ou próximos do vencimento',
  })
  reminders!: FamilyReminderDto[];
}
