import { NearbyProviderResponseDto } from './nearby-provider-response.dto';

export class NearbyProvidersListResponseDto {
  data: NearbyProviderResponseDto[];
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
