import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetPlansDto {
  @ApiPropertyOptional({
    description: 'Operadora (padrão: SAUDE)',
    example: 'SAUDE',
  })
  @IsString()
  @IsOptional()
  operadora?: string = 'SAUDE';
}
