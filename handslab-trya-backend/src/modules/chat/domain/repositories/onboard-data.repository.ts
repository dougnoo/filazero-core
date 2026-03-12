import { OnboardData } from '../value-objects/onboard-data.value-object';

export abstract class IOnboardDataRepository {
  abstract getByUserId(id: string): Promise<OnboardData | null>;
}

export const ONBOARD_DATA_REPOSITORY_TOKEN = 'ONBOARD_DATA_REPOSITORY_TOKEN';
