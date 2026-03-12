import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MedicalDocument,
  MedicalDocumentType,
} from '../../../../database/entities/medical-document.entity';
import { User } from '../../../../database/entities/user.entity';
import {
  FamilyMemberDashboardResponseDto,
  FamilyMemberOnboardDataDto,
  MemberInfoDto,
} from '../dto/family-member-dashboard-response.dto';
import {
  FamilyDocumentStatisticsDto,
  FamilyDocumentCategoryDistributionDto,
  FamilyReminderDto,
} from '../dto/family-dashboard-response.dto';
import { DependentType } from '../../../../shared/domain/enums/dependent-type.enum';
import { TimelineEvent, TimelineEventCategory } from '../../../../database/entities/timeline-event.entity';

export interface GetFamilyMemberDashboardInput {
  ownerUserId: string;
  memberId: string;
}

@Injectable()
export class GetFamilyMemberDashboardUseCase {
  constructor(
    @InjectRepository(MedicalDocument)
    private readonly medicalDocumentRepository: Repository<MedicalDocument>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TimelineEvent)
    private readonly timelineEventRepository: Repository<TimelineEvent>,
  ) {}

  async execute(
    input: GetFamilyMemberDashboardInput,
  ): Promise<FamilyMemberDashboardResponseDto> {
    const { ownerUserId, memberId } = input;

    const member = await this.userRepository.findOne({
      where:
        memberId === ownerUserId
          ? { id: memberId }
          : { id: memberId, subscriberId: ownerUserId },
      relations: ['chronicConditions', 'chronicConditions.condition', 'medications', 'medications.medication'],
    });

    if (!member) {
      throw new NotFoundException('Membro da família não encontrado');
    }

    const documents = await this.medicalDocumentRepository.find({
      where: {
        ownerUserId,
        memberUserId: memberId,
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

    // Health alerts (from timeline ALERT events for this specific member)
    const alertReminders = await this.fetchHealthAlerts(memberId);

    // Merge document reminders and health alerts
    const reminders = [...documentReminders, ...alertReminders]
      .sort((a, b) => {
        // Sort by most recent first
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

    const memberInfo: MemberInfoDto = {
      id: member.id,
      name: member.name,
      cpf: member.cpf,
      birthDate: member.birthDate,
      relationship: this.mapDependentType(member.dependentType),
    };

    const onboard: FamilyMemberOnboardDataDto = {
      chronicConditions:
        member.chronicConditions
          ?.map((item) => item.condition?.name)
          .filter((name): name is string => Boolean(name)) ?? [],
      medications:
        member.medications
          ?.map((item) => {
            const medicationName = item.medication?.name;
            if (!medicationName) {
              return null;
            }

            return item.dosage
              ? `${medicationName} ${item.dosage}`
              : medicationName;
          })
          .filter((name): name is string => Boolean(name)) ?? [],
      allergies:
        member.allergies
          ?.split(',')
          .map((allergy) => allergy.trim())
          .filter(Boolean) ?? [],
    };

    return {
      member: memberInfo,
      onboard,
      documents: statistics,
      categoryDistribution,
      reminders,
    };
  }

  private async fetchHealthAlerts(memberId: string): Promise<FamilyReminderDto[]> {
    // Fetch timeline events with category=ALERT for this specific member
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const alerts = await this.timelineEventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.member', 'member')
      .where('event.category = :category', { category: TimelineEventCategory.ALERT })
      .andWhere('event.member_user_id = :memberId', { memberId })
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

  private mapDependentType(dependentType?: DependentType | null): string {
    if (!dependentType || dependentType === DependentType.SELF) {
      return 'Titular';
    }

    const labels: Record<DependentType, string> = {
      [DependentType.SELF]: 'Titular',
      [DependentType.SPOUSE]: 'Cônjuge',
      [DependentType.CHILD]: 'Filho(a)',
      [DependentType.STEPCHILD]: 'Enteado(a)',
    };

    return labels[dependentType] || dependentType;
  }
}
