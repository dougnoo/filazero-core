import { ApiProperty } from '@nestjs/swagger';

export class UpdateTenantOperatorResponseDto {
  @ApiProperty({ description: 'ID do tenant' })
  id: string;

  @ApiProperty({ description: 'Nome do tenant' })
  name: string;

  @ApiProperty({ description: 'ID da operadora anterior (ou null)' })
  previousOperatorId: string | null;

  @ApiProperty({ description: 'ID da nova operadora' })
  newOperatorId: string;

  @ApiProperty({ description: 'Data da atualização' })
  updatedAt: Date;
}
