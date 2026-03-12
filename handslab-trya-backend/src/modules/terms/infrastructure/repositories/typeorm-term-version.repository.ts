import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TermVersion,
  TermType,
} from '../../../../database/entities/term-version.entity';
import type {
  ITermVersionRepository,
  TermVersionData,
} from '../../domain/repositories/term-version.repository.interface';

@Injectable()
export class TypeOrmTermVersionRepository implements ITermVersionRepository {
  constructor(
    @InjectRepository(TermVersion)
    private readonly repository: Repository<TermVersion>,
  ) {}

  async findByTypeAndVersion(
    type: TermType,
    version: string,
  ): Promise<TermVersionData | null> {
    const term = await this.repository.findOne({ where: { type, version } });
    return term || null;
  }

  async findLatestByType(type: TermType): Promise<TermVersionData | null> {
    const term = await this.repository.findOne({
      where: { type },
      order: { createdAt: 'DESC' },
    });
    return term || null;
  }

  async findById(
    id: string,
  ): Promise<(TermVersionData & { id: string }) | null> {
    const term = await this.repository.findOne({ where: { id } });
    return term || null;
  }

  async findAllByType(
    type: TermType,
  ): Promise<(TermVersionData & { id: string })[]> {
    const terms = await this.repository.find({
      where: { type },
      order: { createdAt: 'DESC' },
    });
    return terms;
  }

  async save(data: TermVersionData): Promise<TermVersionData & { id: string }> {
    const term = this.repository.create(data);
    const saved = await this.repository.save(term);
    return saved;
  }

  async deactivateAllByType(type: TermType): Promise<void> {
    await this.repository.update({ type }, { isActive: false });
  }
}
