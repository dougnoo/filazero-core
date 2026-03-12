import { Injectable, BadRequestException } from '@nestjs/common';
import { IntegrationProvider } from '../../domain/enums/integration-provider.enum';
import type { ITelemedicineStrategy } from '../../domain/interfaces/telemedicine-strategy.interface';
import { ZeloTelemedicineStrategy } from './zelo-telemedicine.strategy';

@Injectable()
export class TelemedicineStrategyFactory {
  constructor(private readonly zeloStrategy: ZeloTelemedicineStrategy) {}

  getStrategy(provider: IntegrationProvider): ITelemedicineStrategy {
    if (provider === IntegrationProvider.ZELO) {
      return this.zeloStrategy;
    }

    throw new BadRequestException(`Provider ${provider} not supported`);
  }
}
