import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchNearbyProvidersDto {
  @ApiProperty({
    description: 'Latitude for geolocation search',
    example: -23.5505,
  })
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Longitude for geolocation search',
    example: -46.6333,
  })
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Health insurance provider name (optional)',
    example: 'Amil',
    required: false,
  })
  @IsString()
  @IsOptional()
  providerName?: string;

  @ApiProperty({
    description: 'Search text for clinic name or specialty (optional)',
    example: 'Cardiologia',
    required: false,
  })
  @IsString()
  @IsOptional()
  searchText?: string;

  @ApiProperty({
    description: 'Plan name filter (optional)',
    example: 'Amil Plan Gold',
    required: false,
  })
  @IsString()
  @IsOptional()
  planName?: string;

  @ApiProperty({
    description: 'Distance in kilometers (default: 5)',
    example: 5,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)  
  @IsOptional()
  distanceKm?: number;

  @ApiProperty({
    description: 'Number of results per page (default: 20, max: 100)',
    example: 20,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiProperty({
    description: 'Page number (default: 1)',
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;
}
