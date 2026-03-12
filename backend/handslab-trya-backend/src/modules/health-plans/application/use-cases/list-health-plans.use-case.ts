import { Injectable } from '@nestjs/common';
import {
  IHealthPlansRepository,
  ListHealthPlansParams,
} from '../../domain/repositories/health-plans.repository';

@Injectable()
export class ListHealthPlansUseCase {
  constructor(private readonly repo: IHealthPlansRepository) {}

  async execute(params: ListHealthPlansParams) {
    return this.repo.list(params);
  }
}
