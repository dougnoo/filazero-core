import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TimelineEventType,
  TimelineEventCategory,
  DocumentStatus,
} from '../../../../database/entities/timeline-event.entity';

export class TimelineEventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: TimelineEventType })
  eventType: TimelineEventType;

  @ApiProperty({ enum: TimelineEventCategory })
  category: TimelineEventCategory;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  eventDate: string;

  @ApiProperty()
  memberName: string;

  @ApiProperty()
  memberUserId: string;

  @ApiPropertyOptional()
  entityType?: string | null;

  @ApiPropertyOptional()
  entityId?: string | null;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown> | null;

  @ApiPropertyOptional({ enum: DocumentStatus })
  documentStatus?: DocumentStatus;

  @ApiPropertyOptional({
    description: 'For alerts (category=ALERT), contains the humanized alert message',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'For alerts (category=ALERT), contains the priority level',
    enum: ['LOW', 'MEDIUM', 'HIGH'],
  })
  priority?: string;

  @ApiProperty()
  createdAt: string;
}

export class PaginatedTimelineResponseDto {
  @ApiProperty({ type: [TimelineEventResponseDto] })
  data: TimelineEventResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
