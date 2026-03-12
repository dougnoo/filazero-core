import { Injectable, Inject } from '@nestjs/common';
import {
  ONBOARD_DATA_REPOSITORY_TOKEN,
  IOnboardDataRepository,
} from '../../domain/repositories/onboard-data.repository';
import { OnboardData } from '../../domain/value-objects/onboard-data.value-object';

@Injectable()
export class GetOnboardDataUseCase {
  constructor(
    @Inject(ONBOARD_DATA_REPOSITORY_TOKEN)
    private readonly onboardDataRepository: IOnboardDataRepository,
  ) {}

  async execute(id: string): Promise<OnboardData | null> {
    return await this.onboardDataRepository.getByUserId(id);
  }
}
