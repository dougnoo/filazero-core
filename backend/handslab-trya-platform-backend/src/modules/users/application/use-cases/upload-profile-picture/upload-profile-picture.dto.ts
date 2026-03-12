import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadProfilePictureDto {
  @ApiProperty({
    description: 'File extension (jpg or png)',
    example: 'jpg',
    enum: ['jpg', 'png'],
  })
  @IsString()
  @IsIn(['jpg', 'png'])
  fileExtension: string;
}
