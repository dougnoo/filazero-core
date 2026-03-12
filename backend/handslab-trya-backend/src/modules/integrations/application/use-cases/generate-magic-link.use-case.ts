import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { IntegrationType } from '../../domain/enums/integration-type.enum';
import type { IIntegrationRepository } from '../../domain/interfaces/integration.repository.interface';
import type { IUserDetailRepository } from 'src/modules/user-management/domain/repositories/user-detail.repository.interface';
import { USER_DETAIL_REPOSITORY_TOKEN } from 'src/modules/user-management/domain/repositories/user-detail.repository.interface';
import type { MagicLinkResult } from '../../domain/interfaces/magic-link-result.interface';
import { INTEGRATION_REPOSITORY_TOKEN } from '../../domain/tokens';
import { TelemedicineStrategyFactory } from '../../telemedicine/strategies/telemedicine-strategy.factory';

@Injectable()
export class GenerateMagicLinkUseCase {
  constructor(
    @Inject(INTEGRATION_REPOSITORY_TOKEN)
    private readonly integrationRepository: IIntegrationRepository,
    @Inject(USER_DETAIL_REPOSITORY_TOKEN)
    private readonly userRepository: IUserDetailRepository,
    private readonly strategyFactory: TelemedicineStrategyFactory,
  ) {}

  async execute(userId: string, tenantId: string): Promise<MagicLinkResult> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.cpf) {
      throw new BadRequestException('User CPF not found');
    }

    const integrations = await this.integrationRepository.findByTypeAndTenant(
      IntegrationType.TELEMEDICINE,
      tenantId,
    );

    const activeIntegration = integrations.find((i) => i.isActive);
    if (!activeIntegration) {
      throw new BadRequestException('No active telemedicine integration found');
    }

    const strategy = this.strategyFactory.getStrategy(
      activeIntegration.provider,
    );
    return strategy.generateMagicLink(user.cpf, user.name, user.email);
  }
}
