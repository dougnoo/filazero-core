import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MedicalDocument,
  MedicalDocumentType,
} from '../../../../database/entities/medical-document.entity';
import {
  FamilyDashboardResponseDto,
  FamilyDocumentStatisticsDto,
  FamilyDocumentCategoryDistributionDto,
  FamilyReminderDto,
} from '../dto/family-dashboard-response.dto';
import { TimelineEvent, TimelineEventCategory } from '../../../../database/entities/timeline-event.entity';
import { User } from '../../../../database/entities/user.entity';

export interface GetFamilyDashboardInput {
  ownerUserId: string;
}

@Injectable()
export class GetFamilyDashboardUseCase {
  constructor(
    @InjectRepository(MedicalDocument)
    private readonly medicalDocumentRepository: Repository<MedicalDocument>,
    @InjectRepository(TimelineEvent)
    private readonly timelineEventRepository: Repository<TimelineEvent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(
    input: GetFamilyDashboardInput,
  ): Promise<FamilyDashboardResponseDto> {
    const { ownerUserId } = input;

    const documents = await this.medicalDocumentRepository.find({
      where: {
        ownerUserId,
      },
      relations: ['member'],
      order: {
        createdAt: 'DESC',
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const registered = documents.length;
    const valid = documents.filter((doc) => {
      if (!doc.validUntil) {
        return true;
      }

      return new Date(doc.validUntil) > today;
    }).length;

    const statistics: FamilyDocumentStatisticsDto = {
      registered,
      valid,
      expired: registered - valid,
    };

    const categoryMap = new Map<string, number>(
      Object.values(MedicalDocumentType).map((documentType) => [documentType, 0]),
    );
    for (const doc of documents) {
      categoryMap.set(doc.documentType, (categoryMap.get(doc.documentType) ?? 0) + 1);
    }

    const categoryDistribution: FamilyDocumentCategoryDistributionDto[] = Array.from(
      categoryMap.entries(),
    ).map(([name, count]) => ({
      name,
      count,
    }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Document reminders (documents expiring within 30 days)
    const documentReminders: FamilyReminderDto[] = documents
      .filter((doc) => {
        if (!doc.validUntil) {
          return false;
        }

        return new Date(doc.validUntil) <= thirtyDaysFromNow;
      })
      .map((doc) => {
        const validUntil = new Date(doc.validUntil!);

        return {
          id: doc.id,
          title: doc.title,
          memberName: doc.member?.name ?? 'Desconhecido',
          type: doc.documentType,
          category: doc.category,
          createdAt: new Date(doc.createdAt).toLocaleDateString('pt-BR'),
          status: validUntil <= today ? 'expired' : 'expiring_soon',
          isAlert: false,
        };
      });

    // Health alerts (from timeline ALERT events)
    const alertReminders = await this.fetchHealthAlerts(ownerUserId);

    // Merge document reminders and health alerts
    const reminders = [...documentReminders, ...alertReminders]
      .sort((a, b) => {
        // Sort by most recent first
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

    return {
      documents: statistics,
      categoryDistribution,
      reminders,
    };
  }

  private async fetchHealthAlerts(ownerUserId: string): Promise<FamilyReminderDto[]> {
    // Get owner and their dependents
    const owner = await this.userRepository.findOne({
      where: { id: ownerUserId },
      relations: ['dependents'],
    });

    if (!owner) {
      return [];
    }

    // Get all member IDs (owner + dependents)
    const memberIds = [ownerUserId];
    if (owner.dependents && owner.dependents.length > 0) {
      memberIds.push(...owner.dependents.map((dep) => dep.id));
    }

    // Fetch timeline events with category=ALERT for this owner and their dependents
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const alerts = await this.timelineEventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.member', 'member')
      .where('event.category = :category', { category: TimelineEventCategory.ALERT })
      .andWhere('event.member_user_id IN (:...memberIds)', { memberIds })
      .andWhere('event.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
      .orderBy('event.created_at', 'DESC')
      .getMany();

    return alerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      memberName: alert.member?.name ?? 'Desconhecido',
      type: alert.eventType,
      category: alert.category,
      createdAt: new Date(alert.createdAt).toLocaleDateString('pt-BR'),
      status: alert.metadata?.priority === 'HIGH' ? 'expired' : 'expiring_soon',
      isAlert: true,
    }));
  }
}
