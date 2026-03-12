import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthPlan } from '../../../../../database/entities/health-plan.entity';
import {
  HealthPlanModel,
  IHealthPlansRepository,
  ListHealthPlansParams,
} from '../../../domain/repositories/health-plans.repository';

export class TypeOrmHealthPlansRepository implements IHealthPlansRepository {
  constructor(
    @InjectRepository(HealthPlan)
    private readonly repo: Repository<HealthPlan>,
  ) {}

  async list(params: ListHealthPlansParams): Promise<HealthPlanModel[]> {
    const qb = this.repo
      .createQueryBuilder('hp')
      .leftJoinAndSelect('hp.operator', 'operator');

    if (params.name) {
      const sanitized = params.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
        .replace(/[^a-zA-Z0-9 ]+/g, ' ') // remove especiais mantendo letras/números/espaço
        .replace(/\s+/g, ' ') // colapsa espaços
        .trim();
      const pattern = `%${sanitized}%`;
      qb.andWhere('unaccent(hp.name) ILIKE unaccent(:pattern)', { pattern });
    }

    if (params.operatorId) {
      qb.andWhere('hp.operator_id = :operatorId', {
        operatorId: params.operatorId,
      });
    }

    qb.orderBy('operator.name', 'ASC').addOrderBy('hp.name', 'ASC');

    const items = await qb.getMany();

    return items.map((plan) => ({
      id: plan.id,
      name: plan.name,
    }));
  }

  async findByNameAndOperator(
    name: string,
    operatorId: string,
  ): Promise<HealthPlanModel | null> {
    const plan = await this.repo
      .createQueryBuilder('hp')
      .where('LOWER(hp.name) = LOWER(:name)', { name })
      .andWhere('hp.operator_id = :operatorId', { operatorId })
      .getOne();
    return plan ? { id: plan.id, name: plan.name } : null;
  }

  async create(name: string, operatorId: string): Promise<HealthPlanModel> {
    const plan = this.repo.create({ name, operatorId });
    const saved = await this.repo.save(plan);
    return { id: saved.id, name: saved.name };
  }
}
