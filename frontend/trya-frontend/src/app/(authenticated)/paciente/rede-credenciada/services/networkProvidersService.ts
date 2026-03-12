import { api } from "@/shared/services/api";
import type { NearbyProvidersResponse, SearchNearbyParams, ChatSearchParams, ChatSearchResponse } from "../types/networkProviders.types";
import { buildQueryParams } from "@/shared/utils";

const BASE = "/api/network-providers";

// Coordenadas default de São Paulo
const DEFAULT_LATITUDE = -23.5505;
const DEFAULT_LONGITUDE = -46.6333;

class NetworkProvidersService {
  async searchNearbyProviders(params: SearchNearbyParams): Promise<NearbyProvidersResponse> {
    const query = buildQueryParams({
      latitude: String(params.latitude),
      longitude: String(params.longitude),
      searchText: params.searchText,
      distanceKm: params.distanceKm ? String(params.distanceKm) : undefined,
      page: params.page ? String(params.page) : undefined,
      limit: params.limit ? String(params.limit) : undefined,
    });
    return api.get<NearbyProvidersResponse>(
      `${BASE}/providers/nearby${query}`,
      "Erro ao buscar prestadores próximos"
    );
  }

  async searchByChat(params: ChatSearchParams): Promise<ChatSearchResponse> {
    const body = {
      message: params.message,
      latitude: params.latitude ?? DEFAULT_LATITUDE,
      longitude: params.longitude ?? DEFAULT_LONGITUDE,
    };
    return api.post<ChatSearchResponse>(
      `${BASE}/chat`,
      body,
      "Erro ao buscar prestadores via chat"
    );
  }
}

export const networkProvidersService = new NetworkProvidersService();
