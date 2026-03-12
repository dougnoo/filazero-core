import { ApiProperty } from '@nestjs/swagger';
import {
  FamilyDocumentStatisticsDto,
  FamilyDocumentCategoryDistributionDto,
  FamilyReminderDto,
} from './family-dashboard-response.dto';

export class MemberInfoDto {
  @ApiProperty({ description: 'ID do membro' })
  id!: string;

  @ApiProperty({ description: 'Nome do membro' })
  name!: string;

  @ApiProperty({ description: 'CPF do membro', required: false })
  cpf?: string;

  @ApiProperty({ description: 'Data de nascimento do membro' })
  birthDate!: Date;

  @ApiProperty({ description: 'Grau de parentesco com o titular' })
  relationship!: string;
}

export class FamilyMemberOnboardDataDto {
  @ApiProperty({
    type: [String],
    description: 'Condições pré-existentes do membro',
  })
  chronicConditions!: string[];

  @ApiProperty({
    type: [String],
    description: 'Medicamentos em uso pelo membro',
  })
  medications!: string[];

  @ApiProperty({
    type: [String],
    description: 'Alergias do membro',
  })
  allergies!: string[];
}

export class FamilyMemberDashboardResponseDto {
  @ApiProperty({
    type: MemberInfoDto,
    description: 'Informações do membro da família',
  })
  member!: MemberInfoDto;

  @ApiProperty({
    type: FamilyMemberOnboardDataDto,
    description: 'Dados de onboard de saúde do membro',
  })
  onboard!: FamilyMemberOnboardDataDto;

  @ApiProperty({
    type: FamilyDocumentStatisticsDto,
    description: 'Estatísticas de documentos do membro',
  })
  documents!: FamilyDocumentStatisticsDto;

  @ApiProperty({
    type: [FamilyDocumentCategoryDistributionDto],
    description: 'Distribuição de documentos do membro por tipo',
  })
  categoryDistribution!: FamilyDocumentCategoryDistributionDto[];

  @ApiProperty({
    type: [FamilyReminderDto],
    description: 'Lembretes de documentos do membro vencidos ou próximos do vencimento',
  })
  reminders!: FamilyReminderDto[];
}
