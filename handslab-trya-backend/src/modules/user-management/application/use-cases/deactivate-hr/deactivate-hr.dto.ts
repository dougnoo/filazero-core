import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeactivateHrDto {
  @ApiProperty({ description: 'ID do usuário RH', example: 'uuid-do-hr' })
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
