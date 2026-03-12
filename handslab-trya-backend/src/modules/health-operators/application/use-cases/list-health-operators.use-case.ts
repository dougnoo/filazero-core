import { Injectable } from '@nestjs/common';
import {
  IHealthOperatorsRepository,
  ListHealthOperatorsParams,
  HealthOperatorModel,
} from '../../domain/repositories/health-operators.repository';

@Injectable()
export class ListHealthOperatorsUseCase {
  constructor(private readonly repo: IHealthOperatorsRepository) {}

  async execute(params: ListHealthOperatorsParams): Promise<HealthOperatorModel[]> {
    return this.repo.list(params);
  }
}
