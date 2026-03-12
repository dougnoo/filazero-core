import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptTermDto {
  @ApiProperty({
    example: 'uuid-term-version-id',
    description: 'ID da versão do termo',
  })
  @IsUUID()
  termVersionId: string;
}
