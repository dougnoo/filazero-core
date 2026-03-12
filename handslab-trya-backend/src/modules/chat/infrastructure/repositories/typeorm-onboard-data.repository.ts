import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnboardDataRepository } from '../../domain/repositories/onboard-data.repository';
import { OnboardData } from '../../domain/value-objects/onboard-data.value-object';
import { User } from '../../../../database/entities/user.entity';

@Injectable()
export class TypeOrmOnboardDataRepository implements IOnboardDataRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  async getByUserId(id: string): Promise<OnboardData | null> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.chronicConditions', 'ucc')
      .leftJoinAndSelect('ucc.condition', 'condition')
      .leftJoinAndSelect('user.medications', 'um')
      .leftJoinAndSelect('um.medication', 'medication')
      .where('user.id = :id', { id })
      .andWhere('user.onboardedAt IS NOT NULL')
      .getOne();

    if (!user) return null;

    return OnboardData.create(
      (user as any).chronicConditions
        ?.map((uc: any) => uc.condition?.name)
        .filter(Boolean) || [],
      (user as any).medications
        ?.map((um: any) => ({
          name: um.medication?.name,
          dosage: um.dosage,
        }))
        .filter((m: any) => m.name) || [],
      user.allergies,
    );
  }
}
