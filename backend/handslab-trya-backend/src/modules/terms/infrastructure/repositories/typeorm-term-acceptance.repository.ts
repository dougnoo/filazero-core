import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TermAcceptance } from '../../../../database/entities/term-acceptance.entity';
import { TermType } from '../../../../database/entities/term-version.entity';
import type { ITermAcceptanceRepository } from '../../domain/repositories/term-acceptance.repository.interface';

@Injectable()
export class TypeOrmTermAcceptanceRepository
  implements ITermAcceptanceRepository
{
  constructor(
    @InjectRepository(TermAcceptance)
    private readonly repository: Repository<TermAcceptance>,
  ) {}

  async hasAcceptedVersion(
    userId: string,
    termVersionId: string,
  ): Promise<boolean> {
    const acceptance = await this.repository.findOne({
      where: { userId, termVersionId },
    });
    return !!acceptance;
  }

  async findLatestAcceptanceByUserAndType(
    userId: string,
    type: TermType,
  ): Promise<{ termVersionId: string } | null> {
    const acceptance = await this.repository
      .createQueryBuilder('acceptance')
      .innerJoin('acceptance.termVersion', 'version')
      .where('acceptance.userId = :userId', { userId })
      .andWhere('version.type = :type', { type })
      .orderBy('acceptance.acceptedAt', 'DESC')
      .select(['acceptance.termVersionId'])
      .getOne();

    return acceptance ? { termVersionId: acceptance.termVersionId } : null;
  }
}
