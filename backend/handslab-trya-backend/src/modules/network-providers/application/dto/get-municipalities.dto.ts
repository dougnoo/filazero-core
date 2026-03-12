import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GetMunicipalitiesDto {
  @ApiProperty({
    description: 'UF do estado',
    example: 'RJ',
  })
  @IsString()
  @IsNotEmpty()
  state: string;
}
