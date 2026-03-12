import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPlan } from '../../../../database/entities/user-plan.entity';
import { INetworkProviderRepository } from '../../domain/repositories/network-provider.repository.interface';

@Injectable()
export class DbNetworkProviderRepository implements INetworkProviderRepository {
  private readonly logger = new Logger(DbNetworkProviderRepository.name);

  constructor(
    @InjectRepository(UserPlan)
    private readonly userPlanRepository: Repository<UserPlan>,
  ) {}

  async getProviderNameByUserId(userId: string): Promise<string> {
    try {
      this.logger.log(
        `[getProviderNameByUserId] Fetching provider name for user: ${userId}`,
      );

      // Busca o plano do usuário
      const userPlan = await this.userPlanRepository.findOne({
        where: { userId },
        relations: ['plan', 'plan.operator'],
      });

      if (!userPlan || !userPlan.plan || !userPlan.plan.operator) {
        throw new Error(
          `User ${userId} does not have an active plan or operator`,
        );
      }

      const providerName = userPlan.plan.operator.name;

      this.logger.log(
        `[getProviderNameByUserId] Found provider: ${providerName} for user: ${userId}`,
      );

      return providerName;
    } catch (error) {
      this.logger.error(
        `[getProviderNameByUserId] Error fetching provider name for user ${userId}:`,
        error.message,
      );
      throw error;
    }
  }

  async getProviderAndPlanNameByUserId(userId: string): Promise<{ providerName: string; planName: string }> {
    try {
      this.logger.log(
        `[getProviderAndPlanNameByUserId] Fetching provider and plan names for user: ${userId}`,
      );

      // Busca o plano do usuário
      const userPlan = await this.userPlanRepository.findOne({
        where: { userId },
        relations: ['plan', 'plan.operator'],
      });

      if (!userPlan || !userPlan.plan || !userPlan.plan.operator) {
        throw new Error(
          `User ${userId} does not have an active plan or operator`,
        );
      }

      const providerName = userPlan.plan.operator.name;
      const planName = userPlan.plan.name;

      this.logger.log(
        `[getProviderAndPlanNameByUserId] Found provider: ${providerName} and plan: ${planName} for user: ${userId}`,
      );

      return { providerName, planName };
    } catch (error) {
      this.logger.error(
        `[getProviderAndPlanNameByUserId] Error fetching provider and plan names for user ${userId}:`,
        error.message,
      );
      throw error;
    }
  }
}
