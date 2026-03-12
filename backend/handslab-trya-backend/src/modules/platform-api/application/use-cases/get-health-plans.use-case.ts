import { Injectable } from '@nestjs/common';
import { IHealthPlansRepository } from '../../../health-plans/domain/repositories/health-plans.repository';

export type GetHealthPlansParams = {
  planName: string;
  tenantId: string;
};

@Injectable()
export class GetHealthPlansUseCase {
  constructor(private readonly healthPlansRepository: IHealthPlansRepository) {}

  async execute(params: GetHealthPlansParams) {
    return await this.healthPlansRepository.list({
      name: params.planName,
    });
  }
}
