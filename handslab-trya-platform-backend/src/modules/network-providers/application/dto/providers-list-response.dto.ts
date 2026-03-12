import { ProviderResponseDto } from './provider-response.dto';

export class ProvidersListResponseDto {
  data: ProviderResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
