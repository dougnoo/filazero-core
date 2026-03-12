import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationCategory } from '../../domain/enums/notification-category.enum';

class AttachmentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  filename: string;

  @ApiProperty()
  @IsString()
  link: string;

  @ApiProperty()
  @IsString()
  size: string;

  @ApiProperty()
  @IsString()
  extension: string;
}

class TriageFinishedDataDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  doctorName: string;

  @ApiProperty({ type: [AttachmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments: AttachmentDto[];
}

export class NotificationWebhookDto {
  @ApiProperty({ example: 'TRIAGE_FINISHED', enum: NotificationCategory })
  @IsEnum(NotificationCategory)
  @IsNotEmpty()
  category: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => TriageFinishedDataDto)
  data: TriageFinishedDataDto;
}
