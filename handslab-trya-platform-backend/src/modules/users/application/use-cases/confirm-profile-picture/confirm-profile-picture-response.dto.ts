import { ApiProperty } from '@nestjs/swagger';

export class ConfirmProfilePictureResponseDto {
  @ApiProperty({
    description: 'The public URL of the uploaded profile picture',
    example:
      'https://bucket.s3.region.amazonaws.com/profile-pictures/user-id/timestamp.jpg',
  })
  profilePictureUrl: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Profile picture updated successfully',
  })
  message: string;
}
