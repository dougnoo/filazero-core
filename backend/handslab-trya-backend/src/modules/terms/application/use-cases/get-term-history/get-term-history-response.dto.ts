import { ApiProperty } from '@nestjs/swagger';
import { TermType } from '../../../../../database/entities/term-version.entity';

export class GetTermHistoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: TermType })
  type: TermType;

  @ApiProperty()
  version: string;

  @ApiProperty()
  s3Url: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  effectiveDate?: Date;

  @ApiProperty({ required: false })
  changeDescription?: string;

  @ApiProperty({ required: false })
  uploadedBy?: string;

  @ApiProperty()
  createdAt: Date;
}
