import { ApiProperty } from '@nestjs/swagger';
import { TermType } from '../../../../../database/entities/term-version.entity';

export class UploadTermResponseDto {
  @ApiProperty({ description: 'ID da versão do termo' })
  id: string;

  @ApiProperty({ enum: TermType, description: 'Tipo do termo' })
  type: TermType;

  @ApiProperty({ description: 'Versão do termo' })
  version: string;

  @ApiProperty({ description: 'URL do arquivo no S3' })
  s3Url: string;

  @ApiProperty({ description: 'Se esta versão está ativa' })
  isActive: boolean;
}
