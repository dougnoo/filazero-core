/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ITutorialRepository } from '../../domain/repositories/tutorial.repository.interface';
import { Tutorial } from '../../domain/entities/tutorial.entity';
import { UserTutorialProgress } from '../../domain/entities/user-tutorial-progress.entity';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

@Injectable()
export class TypeOrmTutorialRepository implements ITutorialRepository {
  constructor(
    @InjectRepository(Tutorial)
    private readonly tutorialRepo: Repository<Tutorial>,
    @InjectRepository(UserTutorialProgress)
    private readonly progressRepo: Repository<UserTutorialProgress>,
  ) {}

  async findPendingByUser(
    email: string,
    tenantId: string,
    role: UserRole,
  ): Promise<Tutorial[]> {
    // Validar tenantId: deve ser um UUID válido
    // Padrão UUID v4/v7: 8-4-4-4-12 caracteres hexadecimais
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!tenantId || !uuidRegex.test(tenantId)) {
      // Se tenantId inválido ou ausente, retornar lista vazia
      // em vez de deixar erro SQL estourar (500)
      return [];
    }

    return this.tutorialRepo
      .createQueryBuilder('t')
      .leftJoin(
        'user_tutorial',
        'ut',
        'ut."tutorialId" = t.id AND ut."tenantId" = :tenantId AND ut."userId" = (SELECT id FROM users WHERE email = :email LIMIT 1)',
        { tenantId, email },
      )
      .where('t."isActive" = :isActive', { isActive: true })
      .andWhere('t."tenantId" = :tenantId', { tenantId })
      .andWhere('t."targetRole" = :role', { role })
      .andWhere('ut.id IS NULL')
      .orderBy('t."order"', 'ASC')
      .getMany();
  }

  async findById(id: string, tenantId: string): Promise<Tutorial | null> {
    return this.tutorialRepo.findOne({
      where: { id, tenantId, isActive: true },
    });
  }

  async findByCode(code: string, tenantId: string): Promise<Tutorial | null> {
    return this.tutorialRepo.findOne({
      where: { code, tenantId },
    });
  }

  async create(tutorial: Tutorial): Promise<Tutorial> {
    return this.tutorialRepo.save(tutorial);
  }

  async saveProgress(data: {
    email: string;
    tutorialId: string;
    tenantId: string;
    completedAt: Date;
    skipped: boolean;
  }): Promise<UserTutorialProgress> {
    const existing = await this.progressRepo
      .createQueryBuilder('ut')
      .innerJoin('ut.user', 'u')
      .where('u.email = :email', { email: data.email })
      .andWhere('ut.tutorialId = :tutorialId', { tutorialId: data.tutorialId })
      .andWhere('ut.tenantId = :tenantId', { tenantId: data.tenantId })
      .getOne();

    if (existing) {
      existing.completedAt = data.completedAt;
      existing.skipped = data.skipped;
      return this.progressRepo.save(existing);
    }

    const user = await this.progressRepo.manager
      .createQueryBuilder()
      .select('u.id', 'id')
      .from('users', 'u')
      .where('u.email = :email', { email: data.email })
      .andWhere('u.tenant_id = :tenantId', { tenantId: data.tenantId })
      .getRawOne();

    if (!user?.id) {
      throw new Error(`User not found with email: ${data.email}`);
    }

    const progress = this.progressRepo.create({
      userId: user.id,
      tutorialId: data.tutorialId,
      tenantId: data.tenantId,
      completedAt: data.completedAt,
      skipped: data.skipped,
    });

    return this.progressRepo.save(progress);
  }
}
