import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GetNeighborhoodsDto {

  @ApiProperty({
    description: 'UF do estado',
    example: 'CE',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Nome do município',
    example: 'Fortaleza',
  })
  @IsString()
  @IsNotEmpty()
  municipality: string;
}
