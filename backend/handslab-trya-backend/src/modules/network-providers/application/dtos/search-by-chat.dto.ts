import { IsString, IsNotEmpty, IsNumber, IsLatitude, IsLongitude } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchByChatDto {
  @ApiProperty({
    description: 'Mensagem do usuário descrevendo a especialidade desejada',
    example: 'Preciso de um cardiologista',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Latitude da localização do usuário',
    example: -23.550520,
  })
  @IsLatitude()
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Longitude da localização do usuário',
    example: -46.633308,
  })
  @IsLongitude()
  @IsNumber()
  longitude: number;
}
