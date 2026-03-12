import { Injectable, Inject } from '@nestjs/common';
import type { IAmilRepository } from '../../domain/repositories/amil-repository.interface';
import { AMIL_REPOSITORY_TOKEN } from '../../domain/repositories/amil-repository.interface';
import { AmilPlan } from '../../domain/entities/amil-plan.entity';

@Injectable()
export class SearchByCpfUseCase {
  constructor(
    @Inject(AMIL_REPOSITORY_TOKEN)
    private readonly amilRepository: IAmilRepository,
  ) {}

  async execute(cpf: string): Promise<AmilPlan[]> {
    if (!cpf) {
      throw new Error('CPF is required');
    }

    const plans = await this.amilRepository.searchByCpf(cpf);
    plans.forEach((plan) => plan.validate());
    return plans;
  }
}
