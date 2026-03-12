import { ApiProperty } from '@nestjs/swagger';

export class GetFileUrlResponseDto {
  @ApiProperty({
    example:
      'https://triagem-saude-dev.s3.us-east-1.amazonaws.com/images/20251209_180728_aff862e0-4734-463c-afba-2e6a921fca72.jpeg?...',
    description: 'Pre-signed URL to access the file',
  })
  url: string;

  @ApiProperty({
    example: '20251209_180728_aff862e0-4734-463c-afba-2e6a921fca72.jpeg',
    description: 'File name',
  })
  fileName: string;
}
