import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Razão social da empresa',
    example: 'Empresa XYZ Ltda',
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  name: string;

  @ApiProperty({
    description: 'ID da operadora vinculada',
    example: 'uuid-da-operadora',
  })
  @IsNotEmpty({ message: 'Operadora é obrigatória' })
  @IsUUID('4', { message: 'ID da operadora deve ser um UUID válido' })
  operatorId: string;
}
