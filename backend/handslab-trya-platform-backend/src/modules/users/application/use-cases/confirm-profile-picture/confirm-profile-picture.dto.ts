import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmProfilePictureDto {
  @ApiProperty({
    description: 'The file key returned from the upload URL generation',
    example:
      'profile-pictures/123e4567-e89b-12d3-a456-426614174000/1640995200000.jpg',
  })
  @IsString()
  fileKey: string;
}
