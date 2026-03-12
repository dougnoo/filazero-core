import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../../../database/entities/tenant.entity';
import { User } from '../../../../database/entities/user.entity';
import { MedicalDocument } from '../../../../database/entities/medical-document.entity';
import { TimelineEvent, TimelineEventCategory } from '../../../../database/entities/timeline-event.entity';
import {
  IHealthAlertSourceRepository,
  TenantSummary,
  FindFamilyDocumentsInput,
  HasRecentAlertInput,
} from '../../domain/health-alert-source.repository.interface';

@Injectable()
export class TypeOrmHealthAlertSourceRepository
  implements IHealthAlertSourceRepository
{
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MedicalDocument)
    private readonly documentRepository: Repository<MedicalDocument>,
    @InjectRepository(TimelineEvent)
    private readonly timelineEventRepository: Repository<TimelineEvent>,
  ) {}

  async findTenants(targetTenantId?: string): Promise<TenantSummary[]> {
    if (targetTenantId) {
      const tenant = await this.tenantRepository.findOne({
        where: { id: targetTenantId },
      });
      return tenant ? [{ id: tenant.id }] : [];
    }

    const tenants = await this.tenantRepository.find({
      select: ['id'],
    });

    return tenants.map((tenant) => ({ id: tenant.id }));
  }

  async findPrimaryUsers(tenantId: string): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.dependents', 'dependents')
      .where('user.tenant_id = :tenantId', { tenantId })
      .andWhere('user.subscriber_id IS NULL')
      .andWhere(
        `EXISTS (
          SELECT 1
          FROM medical_documents doc
          WHERE doc.tenant_id = "user"."tenant_id"
            AND doc.owner_user_id = "user"."id"
        )`,
      )
      .getMany();
  }

  async findFamilyDocuments(
    input: FindFamilyDocumentsInput,
  ): Promise<MedicalDocument[]> {
    return this.documentRepository
      .createQueryBuilder('document')
      .where('document.tenant_id = :tenantId', { tenantId: input.tenantId })
      .andWhere('document.owner_user_id = :ownerUserId', {
        ownerUserId: input.ownerUserId,
      })
      .andWhere('document.valid_until IS NOT NULL')
      .getMany();
  }

  async hasRecentAlert(input: HasRecentAlertInput): Promise<boolean> {
    const query = this.timelineEventRepository
      .createQueryBuilder('event')
      .where('event.tenant_id = :tenantId', { tenantId: input.tenantId })
      .andWhere('event.member_user_id = :memberUserId', {
        memberUserId: input.memberUserId,
      })
      .andWhere('event.category = :category', {
        category: TimelineEventCategory.ALERT,
      })
      .andWhere('event.event_type = :eventType', { eventType: input.alertType })
      .andWhere('event.created_at >= :since', { since: input.since });

    if (input.entityId) {
      query.andWhere('event.entity_id = :entityId', { entityId: input.entityId });
    }

    const existing = await query.getOne();
    return !!existing;
  }
}
