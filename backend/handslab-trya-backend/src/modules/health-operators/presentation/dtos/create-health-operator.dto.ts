import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateHealthOperatorDto {
  @ApiProperty({
    description: 'Nome da operadora de saúde',
    example: 'Bradesco Saúde',
    maxLength: 255,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;
}
