import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class ListHealthOperatorsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtro por nome (mínimo 3 caracteres)',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional({
    description:
      'Se true, retorna apenas operadoras habilitadas (com rede credenciada disponível)',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  enabledOnly?: boolean;
}
