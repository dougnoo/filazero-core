import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ListMedicationsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtro por nome ou princípio ativo (mínimo 3 caracteres)',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;
}
