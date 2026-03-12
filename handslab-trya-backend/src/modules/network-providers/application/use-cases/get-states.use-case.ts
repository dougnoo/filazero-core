import { Injectable, Inject } from '@nestjs/common';
import type { INetworkProviderRepository } from '../../domain/repositories/network-provider.repository.interface';
import { NETWORK_PROVIDER_REPOSITORY_TOKEN } from '../../domain/repositories/network-provider.repository.interface';
import type { INetworkProviderApiRepository } from '../../domain/repositories/network-provider-api.repository.interface';
import { NETWORK_PROVIDER_API_REPOSITORY_TOKEN } from '../../domain/repositories/network-provider-api.repository.interface';

@Injectable()
export class GetStatesUseCase {
  constructor(
    @Inject(NETWORK_PROVIDER_REPOSITORY_TOKEN)
    private readonly networkProviderRepository: INetworkProviderRepository,
    @Inject(NETWORK_PROVIDER_API_REPOSITORY_TOKEN)
    private readonly networkProviderApiRepository: INetworkProviderApiRepository,
  ) {}

  async execute(userId: string): Promise<string[]> {    
    const { providerName, planName } = await this.networkProviderRepository.getProviderAndPlanNameByUserId(
      userId,
    );
    const states = await this.networkProviderApiRepository.getStatesByProvider(
      providerName,
      planName,
    );
    return  states;
  }
}
