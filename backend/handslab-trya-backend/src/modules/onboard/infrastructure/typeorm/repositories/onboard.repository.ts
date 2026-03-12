import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../../database/entities/user.entity';
import { UserChronicCondition } from '../../../../../database/entities/user-chronic-condition.entity';
import { UserMedication } from '../../../../../database/entities/user-medication.entity';
import {
  IOnboardRepository,
  OnboardUserSnapshot,
  SaveOnboardData,
  UpdateHealthDataOptions,
} from '../../../domain/repositories/onboard.repository';
import { UserNotFoundError } from '../../../../../shared/domain/errors/user-not-found.error';

@Injectable()
export class TypeOrmOnboardRepository implements IOnboardRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserChronicCondition)
    private readonly userChronicConditionRepo: Repository<UserChronicCondition>,
    @InjectRepository(UserMedication)
    private readonly userMedicationRepo: Repository<UserMedication>,
  ) {}

  async getUserById(userId: string): Promise<OnboardUserSnapshot | null> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'onboardedAt'],
    });

    return user
      ? {
          id: user.id,
          onboardedAt: user.onboardedAt ?? null,
        }
      : null;
  }

  async save(data: SaveOnboardData): Promise<void> {
    const { userId, chronicConditionIds, medications, allergies } = data;

    const dbUserId = userId;

    // Atualizar alergias e marcar onboard como completo
    await this.userRepo.update(dbUserId, {
      allergies,
      onboardedAt: new Date(),
    });

    // Remover condições crônicas existentes do usuário
    await this.userChronicConditionRepo.delete({ userId: dbUserId });

    // Adicionar novas condições crônicas
    if (chronicConditionIds && chronicConditionIds.length > 0) {
      const userChronicConditions = chronicConditionIds.map((conditionId) =>
        this.userChronicConditionRepo.create({
          userId: dbUserId,
          conditionId,
        }),
      );
      await this.userChronicConditionRepo.save(userChronicConditions);
    }

    // Remover medicações existentes do usuário
    await this.userMedicationRepo.delete({ userId: dbUserId });

    // Adicionar novas medicações
    if (medications && medications.length > 0) {
      const userMedications = medications.map((med) =>
        this.userMedicationRepo.create({
          userId: dbUserId,
          medicationId: med.medicationId,
          dosage: med.dosage || null,
        }),
      );
      await this.userMedicationRepo.save(userMedications);
    }
  }

  async updateHealthData(data: UpdateHealthDataOptions): Promise<void> {
    const {
      userId,
      chronicConditionIds,
      medications,
      allergies,
      merge = true,
    } = data;

    // Buscar usuário no banco por ID
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    const dbUserId = user.id;

    // Atualizar alergias (se fornecidas)
    if (allergies !== undefined) {
      if (merge && user.allergies) {
        // Merge: combina alergias existentes com novas (evitando duplicatas)
        const existingAllergies = user.allergies
          .split(',')
          .map((a) => a.trim().toLowerCase());
        const newAllergies = allergies.split(',').map((a) => a.trim());
        const uniqueNew = newAllergies.filter(
          (a) => !existingAllergies.includes(a.toLowerCase()),
        );
        if (uniqueNew.length > 0) {
          const combined = user.allergies + ', ' + uniqueNew.join(', ');
          await this.userRepo.update(dbUserId, { allergies: combined });
        }
      } else {
        // Sobrescreve ou define pela primeira vez
        await this.userRepo.update(dbUserId, { allergies });
      }
    }

    // Atualizar condições crônicas
    if (chronicConditionIds && chronicConditionIds.length > 0) {
      if (merge) {
        // Busca condições existentes
        const existingConditions = await this.userChronicConditionRepo.find({
          where: { userId: dbUserId },
          select: ['conditionId'],
        });
        const existingIds = new Set(
          existingConditions.map((c) => c.conditionId),
        );

        // Adiciona apenas as novas
        const newConditions = chronicConditionIds.filter(
          (id) => !existingIds.has(id),
        );
        if (newConditions.length > 0) {
          const userChronicConditions = newConditions.map((conditionId) =>
            this.userChronicConditionRepo.create({
              userId: dbUserId,
              conditionId,
            }),
          );
          await this.userChronicConditionRepo.save(userChronicConditions);
        }
      } else {
        // Remove existentes e adiciona novas
        await this.userChronicConditionRepo.delete({ userId: dbUserId });
        const userChronicConditions = chronicConditionIds.map((conditionId) =>
          this.userChronicConditionRepo.create({
            userId: dbUserId,
            conditionId,
          }),
        );
        await this.userChronicConditionRepo.save(userChronicConditions);
      }
    }

    // Atualizar medicações
    if (medications && medications.length > 0) {
      if (merge) {
        // Busca medicações existentes
        const existingMeds = await this.userMedicationRepo.find({
          where: { userId: dbUserId },
          select: ['medicationId'],
        });
        const existingIds = new Set(existingMeds.map((m) => m.medicationId));

        // Adiciona apenas as novas
        const newMeds = medications.filter(
          (m) => !existingIds.has(m.medicationId),
        );
        if (newMeds.length > 0) {
          const userMedications = newMeds.map((med) =>
            this.userMedicationRepo.create({
              userId: dbUserId,
              medicationId: med.medicationId,
              dosage: med.dosage || null,
            }),
          );
          await this.userMedicationRepo.save(userMedications);
        }
      } else {
        // Remove existentes e adiciona novas
        await this.userMedicationRepo.delete({ userId: dbUserId });
        const userMedications = medications.map((med) =>
          this.userMedicationRepo.create({
            userId: dbUserId,
            medicationId: med.medicationId,
            dosage: med.dosage || null,
          }),
        );
        await this.userMedicationRepo.save(userMedications);
      }
    }

    // Se o usuário ainda não completou o onboard, marca como completo
    if (!user.onboardedAt) {
      await this.userRepo.update(dbUserId, { onboardedAt: new Date() });
    }
  }
}
