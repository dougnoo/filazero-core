export interface ProviderLocation {
  hash?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
}

export interface ProviderService {
  id: string;
  specialty: string;
}

export interface Provider {
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
  location?: ProviderLocation | null;
  services?: ProviderService[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProviderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProviderListResponse {
  data: Provider[];
  pagination?: ProviderPagination;
  filters?: Record<string, any>;
}

export interface GetProvidersByFiltersParams {
  providerName: string;
  state: string;
  city: string;
  category?: string;
  specialty?: string;
  neighborhood?: string;
  page?: number;
  limit?: number;
  planName?: string;
}

export interface NearbyProvider {
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
}

export interface NearbyProviderListResponse {
  data: NearbyProvider[];
  count: number;
  pagination: ProviderPagination;
}

export interface SearchNearbyProvidersParams {
  latitude: number;
  longitude: number;
  providerName: string;
  searchText?: string;
  distanceKm?: number;
  page?: number;
  limit?: number;
  planName?: string;
}

