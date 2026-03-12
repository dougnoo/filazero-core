import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medication } from '../../../../../database/entities/medication.entity';
import {
  IMedicationsRepository,
  ListMedicationsParams,
  MedicationModel,
} from '../../../domain/repositories/medications.repository';

export class TypeOrmMedicationsRepository implements IMedicationsRepository {
  constructor(
    @InjectRepository(Medication)
    private readonly repo: Repository<Medication>,
  ) {}

  async list(params: ListMedicationsParams): Promise<MedicationModel[]> {
    const qb = this.repo.createQueryBuilder('m');
    if (params.name) {
      const sanitized = params.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9 ]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const pattern = `%${sanitized}%`;
      qb.where(
        'unaccent(m.name) ILIKE unaccent(:pattern) OR unaccent(m.active_principle) ILIKE unaccent(:pattern)',
        { pattern },
      );
    }
    qb.orderBy('m.name', 'ASC');
    const items = await qb.getMany();
    return items.map((it) => ({
      id: it.id,
      name: it.name,
      activePrinciple: it.activePrinciple ?? null,
    }));
  }

  async findByNames(names: string[]): Promise<MedicationModel[]> {
    if (!names || names.length === 0) return [];

    const qb = this.repo.createQueryBuilder('m');
    const conditions = names.map(
      (_, index) =>
        `(unaccent(m.name) ILIKE unaccent(:name${index}) OR unaccent(m.active_principle) ILIKE unaccent(:name${index}))`,
    );
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

    qb.where(conditions.join(' OR '), params);
    const medications = await qb.getMany();

    return medications.map((m) => ({
      id: m.id,
      name: m.name,
      activePrinciple: m.activePrinciple ?? null,
    }));
  }
}
