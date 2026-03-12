import { Injectable, Inject } from '@nestjs/common';
import type { IAmilRepository } from '../../domain/repositories/amil-repository.interface';
import { AMIL_REPOSITORY_TOKEN } from '../../domain/repositories/amil-repository.interface';

@Injectable()
export class GetPlansUseCase {
  constructor(
    @Inject(AMIL_REPOSITORY_TOKEN)
    private readonly amilRepository: IAmilRepository,
  ) {}

  async execute(operadora: string = 'SAUDE') {
    return this.amilRepository.getPlans(operadora);
  }
}
