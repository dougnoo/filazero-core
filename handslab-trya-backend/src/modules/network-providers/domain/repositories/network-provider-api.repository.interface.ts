import {
  GetProvidersByFiltersParams,
  ProviderListResponse,
  NearbyProviderListResponse,
  SearchNearbyProvidersParams,
} from '../types/providers';
export const NETWORK_PROVIDER_API_REPOSITORY_TOKEN = Symbol(
  'NETWORK_PROVIDER_API_REPOSITORY_TOKEN',
);

export interface INetworkProviderApiRepository {
  getStatesByProvider(providerName: string, planName?: string): Promise<string[]>;
  getMunicipalitiesByState(state: string, providerName: string, planName?: string): Promise<string[]>;
  getNeighborhoodsByMunicipality(state: string, municipality: string, providerName: string, planName?: string): Promise<string[]>;
  getCategoriesByProvider(
    providerName: string,
    state: string,
    city: string,
    neighborhood?: string,
    planName?: string,
  ): Promise<string[]>;
  getSpecialtiesByFilters(
    providerName: string,
    state: string,
    city: string,
    neighborhood?: string,
    category?: string,
    planName?: string,
  ): Promise<string[]>;

  getProvidersByFilters(params: GetProvidersByFiltersParams): Promise<ProviderListResponse>;
  searchNearbyProviders(params: SearchNearbyProvidersParams): Promise<NearbyProviderListResponse>;
}
