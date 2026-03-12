import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChronicCondition } from '../../../../../database/entities/chronic-condition.entity';
import {
  ChronicConditionModel,
  IChronicConditionsRepository,
  ListChronicConditionsParams,
} from '../../../domain/repositories/chronic-conditions.repository';

export class TypeOrmChronicConditionsRepository
  implements IChronicConditionsRepository
{
  constructor(
    @InjectRepository(ChronicCondition)
    private readonly repo: Repository<ChronicCondition>,
  ) {}

  async list(
    params: ListChronicConditionsParams,
  ): Promise<ChronicConditionModel[]> {
    const qb = this.repo.createQueryBuilder('cc');
    if (params.name) {
      const sanitized = params.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
        .replace(/[^a-zA-Z0-9 ]+/g, ' ') // remove especiais mantendo letras/números/espaço
        .replace(/\s+/g, ' ') // colapsa espaços
        .trim();
      const pattern = `%${sanitized}%`;
      qb.where('unaccent(cc.name) ILIKE unaccent(:pattern)', { pattern });
    }
    qb.orderBy('cc.name', 'ASC');
    const items = await qb.getMany();
    return items.map((it) => ({ id: it.id, name: it.name }));
  }

  async findByNames(names: string[]): Promise<ChronicConditionModel[]> {
    if (!names || names.length === 0) {
      return [];
    }

    // Busca parcial por nome usando ILIKE
    // Isso permite encontrar "Diabetes Mellitus Tipo 2" quando o usuário digita "diabetes"
    const qb = this.repo.createQueryBuilder('cc');

    const whereConditions = names.map((name, index) => {
      const paramName = `name${index}`;
      return `unaccent(cc.name) ILIKE unaccent(:${paramName})`;
    });

    const params: Record<string, string> = {};
    names.forEach((name, index) => {
      const sanitized = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9 ]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      params[`name${index}`] = `%${sanitized}%`;
    });

    qb.where(whereConditions.join(' OR '), params);

    const conditions = await qb.getMany();

    return conditions.map((c) => ({ id: c.id, name: c.name }));
  }
}
