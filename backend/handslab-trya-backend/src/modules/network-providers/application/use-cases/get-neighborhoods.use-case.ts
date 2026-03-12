import { Injectable, Inject } from '@nestjs/common';
import type { INetworkProviderRepository } from '../../domain/repositories/network-provider.repository.interface';
import { NETWORK_PROVIDER_REPOSITORY_TOKEN } from '../../domain/repositories/network-provider.repository.interface';
import type { INetworkProviderApiRepository } from '../../domain/repositories/network-provider-api.repository.interface';
import { NETWORK_PROVIDER_API_REPOSITORY_TOKEN } from '../../domain/repositories/network-provider-api.repository.interface';

@Injectable()
export class GetNeighborhoodsUseCase {
  constructor(
    @Inject(NETWORK_PROVIDER_REPOSITORY_TOKEN)
    private readonly networkProviderRepository: INetworkProviderRepository,
    @Inject(NETWORK_PROVIDER_API_REPOSITORY_TOKEN)
    private readonly networkProviderApiRepository: INetworkProviderApiRepository,
  ) {}

  async execute(
    userId: string,
    state: string,
    municipality: string,
  ): Promise<string[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!state) {
      throw new Error('State is required');
    }
    if (!municipality) {
      throw new Error('Municipality is required');
    }

    const { providerName, planName } = await this.networkProviderRepository.getProviderAndPlanNameByUserId(
      userId,
    );

    return this.networkProviderApiRepository.getNeighborhoodsByMunicipality(
      state,
      municipality,
      providerName,
      planName,
    );
  }
}
