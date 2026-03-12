import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryPlansDto {
  @ApiProperty({
    description: 'Nome da operadora para filtrar os planos',
    example: 'Unimed',
  })  
  @IsString()
  providerName?: string;
}
