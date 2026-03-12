import { Injectable, Inject } from '@nestjs/common';
import { IPlanManagementService } from '../../domain/services/plan-management.service.interface';
import type { IHealthOperatorsRepository } from '../../../health-operators/domain/repositories/health-operators.repository';
import type { IHealthPlansRepository } from '../../../health-plans/domain/repositories/health-plans.repository';
import {
  HEALTH_OPERATORS_REPOSITORY_TOKEN,
  HEALTH_PLANS_REPOSITORY_TOKEN,
} from '../../domain/services/service.tokens';
import { InvalidPlanFormatError } from '../../domain/errors/invalid-plan-format.error';

@Injectable()
export class PlanManagementService implements IPlanManagementService {
  constructor(
    @Inject(HEALTH_OPERATORS_REPOSITORY_TOKEN)
    private readonly operatorsRepository: IHealthOperatorsRepository,
    @Inject(HEALTH_PLANS_REPOSITORY_TOKEN)
    private readonly plansRepository: IHealthPlansRepository,
  ) {}

  async getOrCreatePlan(planName: string): Promise<string> {
    if (!planName) throw new InvalidPlanFormatError(planName);

    const parts = planName.split(' - ');
    const code = parts[0]?.trim();
    const rest = parts.slice(1).join(' - ').trim();

    if (!code || !rest) {
      throw new InvalidPlanFormatError(planName);
    }

    // Extrai operadora do resto (primeira palavra)
    const operatorName = rest.split(' ')[0]?.trim();
    const planNameOnly = rest;

    if (!operatorName) {
      throw new InvalidPlanFormatError(planName);
    }

    let operator = await this.operatorsRepository.findByName(operatorName);
    if (!operator) {
      operator = await this.operatorsRepository.create({ name: operatorName });
    }

    let plan = await this.plansRepository.findByNameAndOperator(
      planNameOnly,
      operator.id,
    );
    if (!plan) {
      plan = await this.plansRepository.create(planNameOnly, operator.id);
    }

    return plan.id;
  }
}
