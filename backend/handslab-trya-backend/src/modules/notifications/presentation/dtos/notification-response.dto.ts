import { ApiProperty } from '@nestjs/swagger';
import { NotificationCategory } from '../../domain/enums/notification-category.enum';

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: NotificationCategory })
  category: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  read: boolean;

  @ApiProperty()
  createdAt: Date;
}
