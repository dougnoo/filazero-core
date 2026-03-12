export type SaveOnboardData = {
  userId: string;
  chronicConditionIds?: string[];
  medications?: Array<{
    medicationId: string;
    dosage?: string;
  }>;
  allergies?: string;
};

export type OnboardUserSnapshot = {
  id: string;
  onboardedAt: Date | null;
};

export type UpdateHealthDataOptions = {
  userId: string;
  chronicConditionIds?: string[];
  medications?: Array<{
    medicationId: string;
    dosage?: string;
  }>;
  allergies?: string;
  /** Se true, adiciona aos dados existentes. Se false, sobrescreve. Default: true */
  merge?: boolean;
};

export abstract class IOnboardRepository {
  abstract getUserById(userId: string): Promise<OnboardUserSnapshot | null>;
  abstract save(data: SaveOnboardData): Promise<void>;
  /** Atualiza dados de saúde de um usuário que já completou onboard */
  abstract updateHealthData(data: UpdateHealthDataOptions): Promise<void>;
}
