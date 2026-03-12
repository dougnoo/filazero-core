import { Injectable } from '@nestjs/common';
import {
  IOnboardRepository,
  SaveOnboardData,
} from '../../domain/repositories/onboard.repository';
import { UserNotFoundError } from '../../../../shared/domain/errors/user-not-found.error';

@Injectable()
export class SaveOnboardUseCase {
  constructor(private readonly repo: IOnboardRepository) {}

  async execute(data: SaveOnboardData): Promise<void> {
    const user = await this.repo.getUserById(data.userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.onboardedAt) {
      await this.repo.updateHealthData({
        userId: data.userId,
        chronicConditionIds: data.chronicConditionIds,
        medications: data.medications,
        allergies: data.allergies,
        merge: false,
      });
      return;
    }

    await this.repo.save(data);
  }
}
