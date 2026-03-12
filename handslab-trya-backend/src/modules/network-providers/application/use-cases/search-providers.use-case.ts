import { Injectable, Inject } from '@nestjs/common';
import type { IAmilRepository } from '../../domain/repositories/amil-repository.interface';
import { AMIL_REPOSITORY_TOKEN } from '../../domain/repositories/amil-repository.interface';
import { AmilResult } from '../../domain/entities/amil-provider.entity';

@Injectable()
export class SearchProvidersUseCase {
  constructor(
    @Inject(AMIL_REPOSITORY_TOKEN)
    private readonly amilRepository: IAmilRepository,
  ) {}

  async execute(params: {
    networkCode: string;
    planCode: string;
    state: string;
    municipality: string;
    serviceType: string;
    specialty: string;
    neighborhood?: string;
  }): Promise<AmilResult> {
    if (!params.networkCode) {
      throw new Error('Network code is required');
    }
    if (!params.planCode) {
      throw new Error('Plan code is required');
    }
    if (!params.state) {
      throw new Error('State is required');
    }
    if (!params.municipality) {
      throw new Error('Municipality is required');
    }
    if (!params.serviceType) {
      throw new Error('Service type is required');
    }
    if (!params.specialty) {
      throw new Error('Specialty is required');
    }

    const result = await this.amilRepository.searchProviders(params);
    result.validate();
    return result;
  }
}
