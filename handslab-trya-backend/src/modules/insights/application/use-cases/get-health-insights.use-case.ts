import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull, Not } from 'typeorm';
import { MedicalDocument, MedicalDocumentType } from '../../../../database/entities/medical-document.entity';
import { User } from '../../../../database/entities/user.entity';
import {
  HealthInsightsResponseDto,
  HealthAlertDto,
  ExpiringDocumentDto,
  DocumentStatisticsDto,
  MemberHealthSummaryDto,
} from '../dto/health-insights-response.dto';

export interface GetHealthInsightsInput {
  ownerUserId: string;
  tenantId: string;
}

@Injectable()
export class GetHealthInsightsUseCase {
  private readonly logger = new Logger(GetHealthInsightsUseCase.name);

  constructor(
    @InjectRepository(MedicalDocument)
    private readonly documentRepository: Repository<MedicalDocument>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(input: GetHealthInsightsInput): Promise<HealthInsightsResponseDto> {
    const { ownerUserId, tenantId } = input;

    const familyMemberIds = await this.getFamilyMemberIds(ownerUserId, tenantId);
    const allDocuments = await this.getDocumentsForFamily(
      tenantId,
      ownerUserId,
      familyMemberIds,
    );

    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const statistics = this.calculateStatistics(allDocuments, now, in30Days);
    const expiringDocuments = this.getExpiringDocuments(allDocuments, now, in30Days);
    const alerts = this.generateAlerts(allDocuments, expiringDocuments, now);
    const memberSummaries = await this.getMemberSummaries(
      allDocuments,
      familyMemberIds,
      ownerUserId,
      tenantId,
      now,
    );

    return {
      alerts,
      expiringDocuments,
      statistics,
      memberSummaries,
    };
  }

  private async getFamilyMemberIds(
    ownerUserId: string,
    tenantId: string,
  ): Promise<string[]> {
    const owner = await this.userRepository.findOne({
      where: { id: ownerUserId, tenantId },
      relations: ['dependents'],
    });

    if (!owner) return [ownerUserId];

    const memberIds = [ownerUserId];
    if (owner.dependents) {
      memberIds.push(...owner.dependents.map((d) => d.id));
    }
    return memberIds;
  }

  private async getDocumentsForFamily(
    tenantId: string,
    ownerUserId: string,
    memberIds: string[],
  ): Promise<MedicalDocument[]> {
    return this.documentRepository.find({
      where: {
        tenantId,
        ownerUserId,
        memberUserId: memberIds.length === 1 ? memberIds[0] : undefined,
      },
      relations: ['member'],
      order: { issueDate: 'DESC' },
    });
  }

  private calculateStatistics(
    documents: MedicalDocument[],
    now: Date,
    in30Days: Date,
  ): DocumentStatisticsDto {
    const byType = {} as Record<MedicalDocumentType, number>;
    for (const type of Object.values(MedicalDocumentType)) {
      byType[type] = 0;
    }

    let validDocuments = 0;
    let expiredDocuments = 0;
    let expiringInNext30Days = 0;

    for (const doc of documents) {
      byType[doc.documentType] = (byType[doc.documentType] || 0) + 1;

      if (doc.validUntil) {
        const validUntilDate = new Date(doc.validUntil);
        if (validUntilDate < now) {
          expiredDocuments++;
        } else {
          validDocuments++;
          if (validUntilDate <= in30Days) {
            expiringInNext30Days++;
          }
        }
      } else {
        validDocuments++;
      }
    }

    return {
      totalDocuments: documents.length,
      validDocuments,
      expiredDocuments,
      expiringInNext30Days,
      byType,
    };
  }

  private getExpiringDocuments(
    documents: MedicalDocument[],
    now: Date,
    in30Days: Date,
  ): ExpiringDocumentDto[] {
    return documents
      .filter((doc) => {
        if (!doc.validUntil) return false;
        const validUntilDate = new Date(doc.validUntil);
        return validUntilDate >= now && validUntilDate <= in30Days;
      })
      .map((doc) => {
        const validUntilDate = new Date(doc.validUntil!);
        const daysUntilExpiration = Math.ceil(
          (validUntilDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          id: doc.id,
          title: doc.title,
          documentType: doc.documentType,
          category: doc.category,
          memberName: doc.member?.name || '',
          memberUserId: doc.memberUserId,
          validUntil: doc.validUntil!.toISOString().split('T')[0],
          daysUntilExpiration,
        };
      })
      .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
  }

  private generateAlerts(
    documents: MedicalDocument[],
    expiringDocs: ExpiringDocumentDto[],
    now: Date,
  ): HealthAlertDto[] {
    const alerts: HealthAlertDto[] = [];

    const expiredDocs = documents.filter(
      (doc) => doc.validUntil && new Date(doc.validUntil) < now,
    );
    for (const doc of expiredDocs.slice(0, 3)) {
      alerts.push({
        type: 'EXPIRED',
        priority: 'HIGH',
        title: 'Documento Vencido',
        message: `O documento "${doc.title}" está vencido desde ${new Date(doc.validUntil!).toLocaleDateString('pt-BR')}.`,
        documentId: doc.id,
        memberUserId: doc.memberUserId,
        actionLabel: 'Ver documento',
        actionRoute: `/paciente/documentos/${doc.id}`,
      });
    }

    for (const doc of expiringDocs.slice(0, 5)) {
      alerts.push({
        type: 'EXPIRING_SOON',
        priority: doc.daysUntilExpiration <= 7 ? 'HIGH' : 'MEDIUM',
        title: 'Documento Prestes a Vencer',
        message: `O documento "${doc.title}" vence em ${doc.daysUntilExpiration} dia(s).`,
        documentId: doc.id,
        memberUserId: doc.memberUserId,
        actionLabel: 'Ver documento',
        actionRoute: `/paciente/documentos/${doc.id}`,
      });
    }

    const vaccinations = documents.filter(
      (d) => d.documentType === MedicalDocumentType.VACCINATION,
    );
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    if (vaccinations.length === 0 || 
        !vaccinations.some((v) => new Date(v.issueDate) > sixMonthsAgo)) {
      alerts.push({
        type: 'REMINDER',
        priority: 'LOW',
        title: 'Lembrete de Vacinação',
        message: 'Não encontramos vacinas recentes nos registros. Mantenha suas vacinas em dia.',
        actionLabel: 'Adicionar documento',
        actionRoute: '/paciente/documentos',
      });
    }

    return alerts;
  }

  private async getMemberSummaries(
    documents: MedicalDocument[],
    memberIds: string[],
    ownerUserId: string,
    tenantId: string,
    now: Date,
  ): Promise<MemberHealthSummaryDto[]> {
    const members = await this.userRepository.find({
      where: memberIds.map((id) => ({ id, tenantId })),
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    return members.map((member) => {
      const memberDocs = documents.filter((d) => d.memberUserId === member.id);
      const sortedByDate = [...memberDocs].sort(
        (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
      );

      const docWithValidity = memberDocs
        .filter((d) => d.validUntil && new Date(d.validUntil) > now)
        .sort(
          (a, b) =>
            new Date(a.validUntil!).getTime() - new Date(b.validUntil!).getTime(),
        );

      const recentVaccinations = memberDocs.filter(
        (d) =>
          d.documentType === MedicalDocumentType.VACCINATION &&
          new Date(d.issueDate) > sixMonthsAgo,
      );

      const recentExams = memberDocs.filter(
        (d) =>
          (d.documentType === MedicalDocumentType.LAB_EXAM ||
            d.documentType === MedicalDocumentType.IMAGING_EXAM) &&
          new Date(d.issueDate) > sixMonthsAgo,
      );

      return {
        memberId: member.id,
        memberName: member.name,
        totalDocuments: memberDocs.length,
        lastDocumentDate: sortedByDate[0]
          ? sortedByDate[0].issueDate.toISOString().split('T')[0]
          : null,
        nextExpiration: docWithValidity[0]
          ? docWithValidity[0].validUntil!.toISOString().split('T')[0]
          : null,
        hasRecentVaccination: recentVaccinations.length > 0,
        hasRecentExam: recentExams.length > 0,
      };
    });
  }
}
