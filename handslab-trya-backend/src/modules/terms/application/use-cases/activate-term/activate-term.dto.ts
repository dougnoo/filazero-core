import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateTermDto {
  @ApiProperty({
    example: 'uuid-term-version-id',
    description: 'Term version ID to activate',
  })
  @IsUUID()
  id: string;
}
