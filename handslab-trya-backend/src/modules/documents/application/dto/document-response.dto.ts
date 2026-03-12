import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicalDocumentType, DocumentStatus } from '../../../../database/entities/medical-document.entity';

export class FamilyMemberDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;
}

export class DocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: MedicalDocumentType })
  documentType: MedicalDocumentType;

  @ApiProperty()
  documentTypeLabel: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  memberName: string;

  @ApiProperty()
  memberUserId: string;

  @ApiProperty()
  issueDate: string;

  @ApiPropertyOptional()
  validUntil?: string | null;

  @ApiProperty({ enum: DocumentStatus })
  status: DocumentStatus;

  @ApiProperty()
  viewUrl: string;

  @ApiProperty()
  createdAt: string;
}

export class DocumentDetailDto extends DocumentResponseDto {
  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  mimeType: string;
}

export class DocumentDownloadDto {
  @ApiProperty()
  downloadUrl: string;

  @ApiProperty()
  fileName: string;
}

export class PaginatedDocumentsResponseDto {
  @ApiProperty({ type: [DocumentResponseDto] })
  data: DocumentResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class DocumentCatalogEntryDto {
  @ApiProperty({ enum: MedicalDocumentType })
  type: MedicalDocumentType;

  @ApiProperty()
  label: string;

  @ApiProperty({ type: [String] })
  categories: string[];
}

export class DocumentCatalogResponseDto {
  @ApiProperty({ type: [DocumentCatalogEntryDto] })
  types: DocumentCatalogEntryDto[];
}

export class FamilyMembersResponseDto {
  @ApiProperty({ type: [FamilyMemberDto] })
  members: FamilyMemberDto[];
}
