import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../database/entities/user.entity';
import { UserMedication } from '../../../../database/entities/user-medication.entity';
import { UserChronicCondition } from '../../../../database/entities/user-chronic-condition.entity';
import { UserPlan } from '../../../../database/entities/user-plan.entity';
import type {
  IUserDetailRepository,
  UserDetailModel,
} from '../../domain/repositories/user-detail.repository.interface';

@Injectable()
export class TypeOrmUserDetailRepository implements IUserDetailRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserMedication)
    private readonly userMedicationRepository: Repository<UserMedication>,
    @InjectRepository(UserChronicCondition)
    private readonly userChronicConditionRepository: Repository<UserChronicCondition>,
    @InjectRepository(UserPlan)
    private readonly userPlanRepository: Repository<UserPlan>,
  ) {}

  async findUserById(
    userId: string,
  ): Promise<Pick<UserDetailModel, 'id' | 'cpf' | 'name' | 'email'> | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      cpf: user.cpf || null,
      name: user.name,
      email: user.email || '',
    };
  }

  async findUserDetailByEmail(email: string): Promise<UserDetailModel | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['tenant'],
    });

    if (!user) {
      return null;
    }

    const medications = await this.userMedicationRepository.find({
      where: { userId: user.id },
      relations: ['medication'],
    });

    const chronicConditions = await this.userChronicConditionRepository.find({
      where: { userId: user.id },
      relations: ['condition'],
    });

    const userPlan = await this.userPlanRepository.findOne({
      where: { userId: user.id },
      relations: ['plan', 'plan.operator'],
    });

    return {
      id: user.id,
      email: user.email || '',
      name: user.name,
      role: user.type,
      tenantId: user.tenantId || '',
      tenantName: user.tenant?.name || null,
      cpf: user.cpf || null,
      phone: user.phone || null,
      birthDate: user.birthDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      onboardedAt: user.onboardedAt || null,
      medications: medications.map((m) => ({
        id: m.medication.id,
        name: m.medication.name,
        dosage: m.dosage || null,
      })),
      chronicConditions: chronicConditions.map((c) => ({
        id: c.condition.id,
        name: c.condition.name,
      })),
      allergies: user.allergies || '',
      activePlan: userPlan
        ? {
            planName: userPlan.plan.name,
            operatorName: userPlan.plan.operator.name,
            activeUntil: userPlan.activeUntil || null,
            cardNumber: userPlan.cardNumber,
          }
        : null,
    };
  }

  async findUserDetailById(userId: string): Promise<UserDetailModel | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });

    if (!user) {
      return null;
    }

    const medications = await this.userMedicationRepository.find({
      where: { userId: user.id },
      relations: ['medication'],
    });

    const chronicConditions = await this.userChronicConditionRepository.find({
      where: { userId: user.id },
      relations: ['condition'],
    });

    const userPlan = await this.userPlanRepository.findOne({
      where: { userId: user.id },
      relations: ['plan', 'plan.operator'],
    });

    return {
      id: user.id,
      email: user.email || '',
      name: user.name,
      role: user.type,
      tenantId: user.tenantId || '',
      tenantName: user.tenant?.name || null,
      cpf: user.cpf || null,
      phone: user.phone || null,
      birthDate: user.birthDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      onboardedAt: user.onboardedAt || null,
      medications: medications.map((m) => ({
        id: m.medication.id,
        name: m.medication.name,
        dosage: m.dosage || null,
      })),
      chronicConditions: chronicConditions.map((c) => ({
        id: c.condition.id,
        name: c.condition.name,
      })),
      allergies: user.allergies || '',
      activePlan: userPlan
        ? {
            planName: userPlan.plan.name,
            operatorName: userPlan.plan.operator.name,
            activeUntil: userPlan.activeUntil || null,
            cardNumber: userPlan.cardNumber,
          }
        : null,
    };
  }
}
