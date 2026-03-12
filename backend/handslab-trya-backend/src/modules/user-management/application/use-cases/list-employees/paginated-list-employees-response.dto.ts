import { ApiProperty } from '@nestjs/swagger';
import { ListEmployeesResponseDto } from './list-employees-response.dto';

export class PaginatedListEmployeesResponseDto {
  @ApiProperty({
    type: [ListEmployeesResponseDto],
    description: 'Lista de funcionários',
  })
  data: ListEmployeesResponseDto[];

  @ApiProperty({ description: 'Total de registros', example: 100 })
  total: number;

  @ApiProperty({ description: 'Página atual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Itens por página', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total de páginas', example: 10 })
  totalPages: number;
}
