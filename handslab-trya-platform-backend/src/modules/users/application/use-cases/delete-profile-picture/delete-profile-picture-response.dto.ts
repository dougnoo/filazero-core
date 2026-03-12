import { ApiProperty } from '@nestjs/swagger';

export class DeleteProfilePictureResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Profile picture removed successfully',
  })
  message: string;
}
