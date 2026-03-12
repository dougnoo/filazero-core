import { ApiProperty } from '@nestjs/swagger';

export class UploadProfilePictureResponseDto {
  @ApiProperty({
    description: 'Presigned URL for uploading the profile picture',
    example:
      'https://bucket.s3.region.amazonaws.com/profile-pictures/user-id/timestamp.jpg?X-Amz-Algorithm=...',
  })
  uploadUrl: string;

  @ApiProperty({
    description: 'The key/path where the file will be stored in S3',
    example:
      'profile-pictures/123e4567-e89b-12d3-a456-426614174000/1640995200000.jpg',
  })
  fileKey: string;

  @ApiProperty({
    description:
      'The public URL where the image will be accessible after upload',
    example:
      'https://bucket.s3.region.amazonaws.com/profile-pictures/user-id/timestamp.jpg',
  })
  publicUrl: string;
}
