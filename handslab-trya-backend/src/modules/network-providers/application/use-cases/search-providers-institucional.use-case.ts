import { Injectable, Inject } from '@nestjs/common';
import type { INetworkProviderRepository } from '../../domain/repositories/network-provider.repository.interface';
import { NETWORK_PROVIDER_REPOSITORY_TOKEN } from '../../domain/repositories/network-provider.repository.interface';
import type { INetworkProviderApiRepository } from '../../domain/repositories/network-provider-api.repository.interface';
import { NETWORK_PROVIDER_API_REPOSITORY_TOKEN } from '../../domain/repositories/network-provider-api.repository.interface';

@Injectable()
export class SearchProvidersInstitucionalUseCase {
  constructor(
    @Inject(NETWORK_PROVIDER_REPOSITORY_TOKEN)
    private readonly networkProviderRepository: INetworkProviderRepository,
    @Inject(NETWORK_PROVIDER_API_REPOSITORY_TOKEN)
    private readonly networkProviderApiRepository: INetworkProviderApiRepository,
  ) {}

  async execute(params: {
    userId: string;
    state: string;
    city: string;
    category?: string;
    specialty?: string;
    neighborhood?: string;
    page?: number;
    limit?: number;
  }) {
    const { providerName, planName } = await this.networkProviderRepository.getProviderAndPlanNameByUserId(
      params.userId,
    );

    const result = await this.networkProviderApiRepository.getProvidersByFilters({
      providerName,
      state: params.state,
      city: params.city,
      category: params.category,
      specialty: params.specialty,
      neighborhood: params.neighborhood,
      page: params.page,
      limit: params.limit,
      planName,
    });
    
    const { filters, ...rest } = result;
    return rest;
  }
}
