import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AttachmentDto {
  @ApiProperty({
    description: 'S3 object key where the file is stored',
    example: 'medical-docs/tenant_789/session_abc123xyz/hemograma.pdf',
  })
  @IsString()
  @IsNotEmpty()
  s3_key: string;

  @ApiProperty({
    description: 'Original filename uploaded by user',
    example: 'hemograma.pdf',
  })
  @IsString()
  @IsNotEmpty()
  original_name: string;
}
