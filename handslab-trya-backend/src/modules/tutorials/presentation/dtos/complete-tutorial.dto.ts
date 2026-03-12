import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteTutorialDto {
  @ApiProperty({
    example: false,
    description: 'Whether the tutorial was skipped',
  })
  @IsBoolean()
  skipped: boolean;
}
