import { ApiProperty } from '@nestjs/swagger';

export class ListTenantsResponseDto {
  @ApiProperty({
    description: 'ID do tenant',
    example: 'dd6f2fce-c6f5-46e1-bf58-abb1e52d4832',
  })
  id: string;

  @ApiProperty({ description: 'Nome do tenant', example: 'Grupo Trigo' })
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
