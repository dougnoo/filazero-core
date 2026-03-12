import { ApiProperty } from '@nestjs/swagger';
import { TermType } from '../../../../../database/entities/term-version.entity';

export class GetLatestTermResponseDto {
  @ApiProperty({ example: 'term-version-uuid-1234' })
  id?: string;

  @ApiProperty({ enum: TermType })
  type: TermType;

  @ApiProperty({ example: '1' })
  version: string;

  @ApiProperty({
    description: 'URL do documento (armazenada no banco, gerada no upload)',
    example: 'https://cdn.example.com/terms/latest.pdf',
  })
  s3Url: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2025-01-07T13:26:48.639Z' })
  createdAt: Date;
}
