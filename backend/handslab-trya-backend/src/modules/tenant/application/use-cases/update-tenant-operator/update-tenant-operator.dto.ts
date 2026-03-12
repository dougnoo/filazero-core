import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTenantOperatorDto {
  @ApiProperty({
    description: 'ID da nova operadora',
    example: 'uuid-da-operadora',
  })
  @IsNotEmpty({ message: 'ID da operadora é obrigatório' })
  @IsUUID('4', { message: 'ID da operadora deve ser um UUID válido' })
  operatorId: string;
}
