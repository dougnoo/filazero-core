import { Injectable, Inject } from '@nestjs/common';
import {
  IOnboardRepository,
  UpdateHealthDataOptions,
} from '../../domain/repositories/onboard.repository';
import { IChronicConditionsRepository } from '../../domain/repositories/chronic-conditions.repository';
import { IMedicationsRepository } from '../../domain/repositories/medications.repository';

@Injectable()
export class UpdateHealthDataUseCase {
  constructor(
    @Inject(IOnboardRepository)
    private readonly repo: IOnboardRepository,
    @Inject(IChronicConditionsRepository)
    private readonly chronicConditionRepo: IChronicConditionsRepository,
    @Inject(IMedicationsRepository)
    private readonly medicationRepo: IMedicationsRepository,
  ) {}

  /**
   * Atualiza dados de saúde de um usuário.
   * Faz lookup de medicamentos e condições crônicas por nome.
   * Suporta merge (adiciona aos dados existentes) ou replace (sobrescreve).
   */
  async execute(data: {
    userId: string;
    chronicConditions?: string[];
    medications?: string[];
    allergies?: string;
    merge?: boolean;
  }): Promise<void> {
    const chronicConditionIds: string[] = [];
    const medicationItems: Array<{ medicationId: string }> = [];

    if (data.chronicConditions && data.chronicConditions.length > 0) {
      const conditions = await this.chronicConditionRepo.findByNames(
        data.chronicConditions,
      );
      chronicConditionIds.push(...conditions.map((c) => c.id));
    }

    if (data.medications && data.medications.length > 0) {
      const meds = await this.medicationRepo.findByNames(data.medications);
      medicationItems.push(...meds.map((m) => ({ medicationId: m.id })));
    }

    const updateData: UpdateHealthDataOptions = {
      userId: data.userId,
      chronicConditionIds:
        chronicConditionIds.length > 0 ? chronicConditionIds : undefined,
      medications: medicationItems.length > 0 ? medicationItems : undefined,
      allergies: data.allergies,
      merge: data.merge ?? true,
    };

    await this.repo.updateHealthData(updateData);
  }
}
