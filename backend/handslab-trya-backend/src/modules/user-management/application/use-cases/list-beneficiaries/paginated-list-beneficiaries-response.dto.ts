import { ApiProperty } from '@nestjs/swagger';
import { ListBeneficiariesResponseDto } from './list-beneficiaries-response.dto';

export class PaginatedListBeneficiariesResponseDto {
  @ApiProperty({
    type: [ListBeneficiariesResponseDto],
    description: 'Lista de beneficiários',
  })
  data: ListBeneficiariesResponseDto[];

  @ApiProperty({ description: 'Total de registros', example: 100 })
  total: number;

  @ApiProperty({ description: 'Página atual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Itens por página', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total de páginas', example: 10 })
  totalPages: number;
}
