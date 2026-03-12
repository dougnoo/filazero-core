import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetBrokerThemeDto {
  @ApiProperty({
    description: 'Nome do tenant/broker',
    example: 'broken-company',
  })
  @IsString({ message: 'Nome do tenant deve ser uma string' })
  @IsNotEmpty({ message: 'Nome do tenant é obrigatório' })
  tenantName: string;
}
