import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchNearbyProvidersDto {
  @ApiProperty({ description: 'Latitude', example: -22.7217698078544 })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  latitude: number;

  @ApiProperty({ description: 'Longitude', example: -43.445329996961256 })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  longitude: number;

  @ApiPropertyOptional({
    description: 'Texto para busca (opcional)',
    example: 'NEUR',
  })
  @IsString()
  @IsOptional()
  searchText?: string;

  @ApiPropertyOptional({
    description: 'Distância em quilômetros (opcional)',
    example: 1000,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  distanceKm?: number;

  @ApiPropertyOptional({
    description: 'Número da página',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Quantidade de itens por página',
    example: 10,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
