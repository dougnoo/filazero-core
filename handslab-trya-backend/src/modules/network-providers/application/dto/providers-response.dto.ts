export interface ProviderLocationDto {
  hash?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
}

export interface ProviderServiceDto {
  id: string;
  specialty: string;
}

export interface ProviderDto {
  id: string;
  name: string;
  category: string;
  address: string;
  addressComplement?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  zipCode?: string | null;
  phone?: string | null;
  location?: ProviderLocationDto | null;
  services?: ProviderServiceDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProviderPaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProviderListResponseDto {
  data: ProviderDto[];
  pagination?: ProviderPaginationDto;
  filters?: Record<string, any>;
}
