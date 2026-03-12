import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthOperator } from '../../../../../database/entities/health-operator.entity';
import {
  CreateHealthOperatorData,
  HealthOperatorModel,
  IHealthOperatorsRepository,
  ListHealthOperatorsParams,
} from '../../../domain/repositories/health-operators.repository';
import { HealthOperatorStatus } from '../../../../../shared/domain/enums/health-operator-status.enum';

export class TypeOrmHealthOperatorsRepository
  implements IHealthOperatorsRepository
{
  constructor(
    @InjectRepository(HealthOperator)
    private readonly repo: Repository<HealthOperator>,
  ) {}

  async list(
    params: ListHealthOperatorsParams,
  ): Promise<HealthOperatorModel[]> {
    const qb = this.repo.createQueryBuilder('ho');

    if (params.name) {
      const sanitized = params.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
        .replace(/[^a-zA-Z0-9 ]+/g, ' ') // remove especiais mantendo letras/números/espaço
        .replace(/\s+/g, ' ') // colapsa espaços
        .trim();
      const pattern = `%${sanitized}%`;
      qb.where('unaccent(ho.name) ILIKE unaccent(:pattern)', { pattern });
    }

    if (params.enabledOnly) {
      qb.andWhere('ho.status = :status', {
        status: HealthOperatorStatus.REDE_CREDENCIADA_DISPONIVEL,
      });
    }

    qb.orderBy('ho.name', 'ASC');
    const items = await qb.getMany();
    return items.map((it) => ({
      id: it.id,
      name: it.name,
      status: it.status,
    }));
  }

  async findByName(name: string): Promise<HealthOperatorModel | null> {
    const operator = await this.repo
      .createQueryBuilder('ho')
      .where('LOWER(ho.name) = LOWER(:name)', { name })
      .getOne();
    return operator
      ? { id: operator.id, name: operator.name, status: operator.status }
      : null;
  }

  async findById(id: string): Promise<HealthOperatorModel | null> {
    const operator = await this.repo.findOne({ where: { id } });
    return operator
      ? { id: operator.id, name: operator.name, status: operator.status }
      : null;
  }

  async create(data: CreateHealthOperatorData): Promise<HealthOperatorModel> {
    const operator = this.repo.create({
      name: data.name,
      status: HealthOperatorStatus.CADASTRADA,
    });
    const saved = await this.repo.save(operator);
    return { id: saved.id, name: saved.name, status: saved.status };
  }

  async updateStatus(
    id: string,
    status: HealthOperatorStatus,
  ): Promise<HealthOperatorModel> {
    await this.repo.update(id, { status });
    const updated = await this.repo.findOneOrFail({ where: { id } });
    return { id: updated.id, name: updated.name, status: updated.status };
  }
}
