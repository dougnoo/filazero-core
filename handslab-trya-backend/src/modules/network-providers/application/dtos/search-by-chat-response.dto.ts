import { ApiProperty } from '@nestjs/swagger';
import { NearbyProviderListResponse } from '../../domain/types/providers';

export class SearchByChatResponseDto implements NearbyProviderListResponse {
  @ApiProperty({
    description: 'Lista de prestadores encontrados',
    isArray: true,
  })
  data: Array<{
    id: string;
    name: string;
    address: string;
    neighborhood?: string | null;
    city: string;
    state: string;
    zipCode?: string | null;
    phone?: string | null;
    phone2?: string | null;
    whatsapp?: string | null;
    specialty?: string[];
    distance: number;
    latitude: number;
    longitude: number;
  }>;

  @ApiProperty({
    description: 'Total de prestadores encontrados',
    example: 5,
  })
  count: number;

  @ApiProperty({
    description: 'Informações de paginação',
    example: {
      page: 1,
      limit: 10,
      total: 5,
      totalPages: 1,
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  @ApiProperty({
    description: 'Mensagem de resposta para o usuário',
    example: 'Olá! Encontrei 5 locais mais próximos a você. Veja na listagem abaixo.',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: 'Especialidade extraída da mensagem',
    required: false,
  })
  extractedSpecialty?: string;
}
