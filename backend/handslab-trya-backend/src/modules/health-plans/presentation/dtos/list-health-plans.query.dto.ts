import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class ListHealthPlansQueryDto {
  @ApiPropertyOptional({
    description: 'Filtro por nome do plano (mínimo 3 caracteres)',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional({ description: 'Filtro por ID da operadora (UUID)' })
  @IsOptional()
  @IsUUID()
  operatorId?: string;
}
