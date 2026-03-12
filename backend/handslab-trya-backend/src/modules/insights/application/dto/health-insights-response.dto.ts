import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicalDocumentType } from '../../../../database/entities/medical-document.entity';

export class ExpiringDocumentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: MedicalDocumentType })
  documentType: MedicalDocumentType;

  @ApiProperty()
  category: string;

  @ApiProperty()
  memberName: string;

  @ApiProperty()
  memberUserId: string;

  @ApiProperty()
  validUntil: string;

  @ApiProperty()
  daysUntilExpiration: number;
}

export class DocumentStatisticsDto {
  @ApiProperty()
  totalDocuments: number;

  @ApiProperty()
  validDocuments: number;

  @ApiProperty()
  expiredDocuments: number;

  @ApiProperty()
  expiringInNext30Days: number;

  @ApiProperty({
    description: 'Documentos por tipo',
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  byType: Record<MedicalDocumentType, number>;
}

export class MemberHealthSummaryDto {
  @ApiProperty()
  memberId: string;

  @ApiProperty()
  memberName: string;

  @ApiProperty()
  totalDocuments: number;

  @ApiProperty()
  lastDocumentDate: string | null;

  @ApiPropertyOptional()
  nextExpiration: string | null;

  @ApiProperty()
  hasRecentVaccination: boolean;

  @ApiProperty()
  hasRecentExam: boolean;
}

export class HealthAlertDto {
  @ApiProperty()
  type: 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING_DOCUMENT' | 'REMINDER';

  @ApiProperty()
  priority: 'HIGH' | 'MEDIUM' | 'LOW';

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional()
  documentId?: string;

  @ApiPropertyOptional()
  memberUserId?: string;

  @ApiProperty()
  actionLabel: string;

  @ApiProperty()
  actionRoute: string;
}

export class HealthInsightsResponseDto {
  @ApiProperty({ type: [HealthAlertDto] })
  alerts: HealthAlertDto[];

  @ApiProperty({ type: [ExpiringDocumentDto] })
  expiringDocuments: ExpiringDocumentDto[];

  @ApiProperty({ type: DocumentStatisticsDto })
  statistics: DocumentStatisticsDto;

  @ApiProperty({ type: [MemberHealthSummaryDto] })
  memberSummaries: MemberHealthSummaryDto[];
}
