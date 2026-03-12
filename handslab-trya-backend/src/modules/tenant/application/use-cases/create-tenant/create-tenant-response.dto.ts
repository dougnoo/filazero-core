import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantResponseDto {
  @ApiProperty({
    description: 'ID único do tenant',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Razão social da empresa',
    example: 'Empresa XYZ Ltda',
  })
  name: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-11-04T12:00:00.000Z',
  })
  createdAt: Date;
}
