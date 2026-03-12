import { Injectable, Inject } from '@nestjs/common';
import type { INetworkProviderRepository } from '../../domain/repositories/network-provider.repository.interface';
import { NETWORK_PROVIDER_REPOSITORY_TOKEN } from '../../domain/repositories/network-provider.repository.interface';
import type { INetworkProviderApiRepository } from '../../domain/repositories/network-provider-api.repository.interface';
import { NETWORK_PROVIDER_API_REPOSITORY_TOKEN } from '../../domain/repositories/network-provider-api.repository.interface';
import { NearbyProviderListResponse } from '../../domain/types/providers';

@Injectable()
export class SearchNearbyProvidersUseCase {
  constructor(
    @Inject(NETWORK_PROVIDER_REPOSITORY_TOKEN)
    private readonly networkProviderRepository: INetworkProviderRepository,
    @Inject(NETWORK_PROVIDER_API_REPOSITORY_TOKEN)
    private readonly networkProviderApiRepository: INetworkProviderApiRepository,
  ) {}

  async execute(params: {
    userId: string;
    latitude: number;
    longitude: number;
    searchText?: string;
    distanceKm?: number;
    page?: number;
    limit?: number;
  }): Promise<NearbyProviderListResponse> {
    if (!params.userId) {
      throw new Error('User ID is required');
    }
    if (params.latitude === undefined || params.latitude === null) {
      throw new Error('Latitude is required');
    }
    if (params.longitude === undefined || params.longitude === null) {
      throw new Error('Longitude is required');
    }

    const { providerName, planName } = await this.networkProviderRepository.getProviderAndPlanNameByUserId(
      params.userId,
    );

    const result = await this.networkProviderApiRepository.searchNearbyProviders({
      latitude: params.latitude,
      longitude: params.longitude,
      providerName,
      searchText: params.searchText,
      distanceKm: params.distanceKm,
      page: params.page,
      limit: params.limit,
      planName,
    });

    return result;
  }
}
