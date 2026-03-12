import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SearchByCpfDto {
  @ApiProperty({
    description: 'CPF do beneficiário',
    example: '14488694713',
  })
  @IsString()
  @IsNotEmpty()
  cpf: string;
}
