import { Injectable, Inject } from '@nestjs/common';
import {
  IOnboardRepository,
  SaveOnboardData,
} from '../../domain/repositories/onboard.repository';
import { IChronicConditionsRepository } from '../../domain/repositories/chronic-conditions.repository';
import { IMedicationsRepository } from '../../domain/repositories/medications.repository';

@Injectable()
export class SaveOnboardExternalUseCase {
  constructor(
    @Inject(IOnboardRepository)
    private readonly repo: IOnboardRepository,
    @Inject(IChronicConditionsRepository)
    private readonly chronicConditionRepo: IChronicConditionsRepository,
    @Inject(IMedicationsRepository)
    private readonly medicationRepo: IMedicationsRepository,
  ) {}

  async execute(data: {
    userId: string;
    chronicConditions?: string[];
    medications?: string[];
    allergies?: string;
  }): Promise<void> {
    const chronicConditionIds: string[] = [];
    const medicationItems: Array<{ medicationId: string }> = [];

    if (data.chronicConditions && data.chronicConditions.length > 0) {
      for (const conditionName of data.chronicConditions) {
        const conditions = await this.chronicConditionRepo.findByNames([
          conditionName,
        ]);
        if (conditions.length > 0) {
          // Ranking de prioridade para seleção da melhor condição crônica:
          // 1. Nome exato (ex: "diabetes" = "DIABETES")
          // 2. Nome começa com termo (ex: "diabetes" → "DIABETES MELLITUS")
          // 3. Em caso de empate no rank 2, escolhe o nome mais curto (mais específico)
          const bestMatch = conditions.reduce((best, current) => {
            const normalize = this.normalizeString();
            const searchTerm = normalize(conditionName);
            const bestName = normalize(best.name);
            const currentName = normalize(current.name);

            if (currentName === searchTerm) return current;
            if (bestName === searchTerm) return best;
            if (
              currentName.startsWith(searchTerm) &&
              !bestName.startsWith(searchTerm)
            )
              return current;
            if (
              bestName.startsWith(searchTerm) &&
              !currentName.startsWith(searchTerm)
            )
              return best;
            if (
              currentName.startsWith(searchTerm) &&
              bestName.startsWith(searchTerm)
            ) {
              return best.name.length < current.name.length ? best : current;
            }
            return best.name.length < current.name.length ? best : current;
          });
          chronicConditionIds.push(bestMatch.id);
        }
      }
    }

    if (data.medications && data.medications.length > 0) {
      for (const medName of data.medications) {
        const meds = await this.medicationRepo.findByNames([medName]);
        if (meds.length > 0) {
          // Ranking de prioridade para seleção do melhor medicamento:
          // 1. Nome exato (ex: "dipirona" = "DIPIRONA")
          // 2. Princípio ativo exato (ex: "dipirona" = princípio ativo "DIPIRONA")
          // 3. Nome começa com termo (ex: "dipirona" → "DIPIRONA SÓDICA")
          // 4. Princípio ativo começa com termo
          // 5. Em caso de empate nos ranks 3-4, escolhe o nome mais curto (mais específico)
          const bestMatch = meds.reduce((best, current) => {
            const normalize = this.normalizeString();
            const searchTerm = normalize(medName);
            const bestName = normalize(best.name);
            const currentName = normalize(current.name);
            const bestPrinciple = normalize(best.activePrinciple || '');
            const currentPrinciple = normalize(current.activePrinciple || '');

            if (currentName === searchTerm) return current;
            if (bestName === searchTerm) return best;
            if (currentPrinciple === searchTerm) return current;
            if (bestPrinciple === searchTerm) return best;
            if (
              currentName.startsWith(searchTerm) &&
              !bestName.startsWith(searchTerm)
            )
              return current;
            if (
              bestName.startsWith(searchTerm) &&
              !currentName.startsWith(searchTerm)
            )
              return best;
            if (
              currentPrinciple.startsWith(searchTerm) &&
              !bestPrinciple.startsWith(searchTerm)
            )
              return current;
            if (
              bestPrinciple.startsWith(searchTerm) &&
              !currentPrinciple.startsWith(searchTerm)
            )
              return best;
            if (
              currentName.startsWith(searchTerm) &&
              bestName.startsWith(searchTerm)
            ) {
              return best.name.length < current.name.length ? best : current;
            }
            return best.name.length < current.name.length ? best : current;
          });
          medicationItems.push({ medicationId: bestMatch.id });
        }
      }
    }

    const saveData: SaveOnboardData = {
      userId: data.userId,
      chronicConditionIds:
        chronicConditionIds.length > 0 ? chronicConditionIds : undefined,
      medications: medicationItems.length > 0 ? medicationItems : undefined,
      allergies: data.allergies ? data.allergies.toUpperCase() : undefined,
    };

    await this.repo.save(saveData);
  }

  private normalizeString() {
    return (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
  }
}
