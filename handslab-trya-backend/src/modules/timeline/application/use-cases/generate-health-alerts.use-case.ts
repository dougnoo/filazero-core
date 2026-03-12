import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MedicalDocument } from '../../../../database/entities/medical-document.entity';
import { User } from '../../../../database/entities/user.entity';
import { TimelineService } from '../services/timeline.service';
import type { IAlertRule } from '../../domain/alerts/alert-rule.interface';
import {
  DOCUMENT_EXPIRING_RULE_TOKEN,
  DOCUMENT_EXPIRED_RULE_TOKEN,
} from '../../domain/alerts/alert-rule.interface';
import {
  HEALTH_ALERT_SOURCE_REPOSITORY_TOKEN,
  TenantSummary,
} from '../../domain/health-alert-source.repository.interface';
import type { IHealthAlertSourceRepository } from '../../domain/health-alert-source.repository.interface';
import { ALERT_DEDUPLICATION_POLICY_TOKEN } from '../policies/alert-deduplication.policy';
import type { IAlertDeduplicationPolicy } from '../policies/alert-deduplication.policy';

export interface GenerateHealthAlertsInput {
  tenantId?: string; // If provided, only process this tenant
}

@Injectable()
export class GenerateHealthAlertsUseCase {
  private readonly logger = new Logger(GenerateHealthAlertsUseCase.name);

  constructor(
    @Inject(HEALTH_ALERT_SOURCE_REPOSITORY_TOKEN)
    private readonly healthAlertSourceRepository: IHealthAlertSourceRepository,
    @Inject(ALERT_DEDUPLICATION_POLICY_TOKEN)
    private readonly alertDeduplicationPolicy: IAlertDeduplicationPolicy,
    private readonly timelineService: TimelineService,
    @Inject(DOCUMENT_EXPIRING_RULE_TOKEN)
    private readonly expiringRule: IAlertRule,
    @Inject(DOCUMENT_EXPIRED_RULE_TOKEN)
    private readonly expiredRule: IAlertRule,
  ) {}

  /**
   * Scheduled task: runs daily at 6 AM UTC
   * Generates health alerts for all family members
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async execute(input?: GenerateHealthAlertsInput): Promise<void> {
    try {
      this.logger.log('Starting health alerts generation...');

      const tenants = await this.healthAlertSourceRepository.findTenants(
        input?.tenantId,
      );

      for (const tenant of tenants) {
        await this.processTenant(tenant);
      }

      this.logger.log('Health alerts generation completed successfully');
    } catch (error) {
      this.logger.error('Error generating health alerts', error);
      throw error;
    }
  }

  private async processTenant(tenant: TenantSummary): Promise<void> {
    this.logger.log(`Processing tenant: ${tenant.id}`);

    try {
      const mainUsers = await this.healthAlertSourceRepository.findPrimaryUsers(
        tenant.id,
      );

      for (const mainUser of mainUsers) {
        await this.processFamilyMembers(tenant, mainUser);
      }
    } catch (error) {
      this.logger.error(
        `Error processing tenant ${tenant.id}`,
        error,
      );
    }
  }

  private async processFamilyMembers(
    tenant: TenantSummary,
    mainUser: User,
  ): Promise<void> {
    const familyDocuments = await this.healthAlertSourceRepository.findFamilyDocuments(
      {
        tenantId: tenant.id,
        ownerUserId: mainUser.id,
      },
    );

    if (familyDocuments.length === 0) {
      return;
    }

    const documentsByMember = this.groupDocumentsByMember(familyDocuments);
    const members: User[] = [mainUser, ...(mainUser.dependents || [])];
    const membersWithDocuments = members.filter((member) =>
      documentsByMember.has(member.id),
    );

    for (const member of membersWithDocuments) {
      const documents = documentsByMember.get(member.id) ?? [];
      await this.processMember(tenant, member, documents);
    }
  }

  private async processMember(
    tenant: TenantSummary,
    member: User,
    documents: MedicalDocument[],
  ): Promise<void> {
    try {
      for (const rule of this.getAlertRules()) {
        try {
          const canGenerate = await rule.canGenerate(member, documents);
          if (!canGenerate) {
            continue;
          }

          const alertPayload = await rule.generateAlert(member, documents);
          if (!alertPayload) {
            continue;
          }

          const since = this.alertDeduplicationPolicy.getSinceDate();

          const existingAlert = await this.healthAlertSourceRepository.hasRecentAlert({
            tenantId: tenant.id,
            memberUserId: member.id,
            alertType: alertPayload.type,
            entityId: alertPayload.entityId,
            since,
          });

          if (existingAlert) {
            this.logger.debug(
              `Alert already exists for member ${member.id}: ${alertPayload.type}`,
            );
            continue;
          }

          await this.timelineService.registerAlert(
            member.id,
            tenant.id,
            alertPayload,
          );

          this.logger.log(
            `Alert generated for member ${member.id}: ${alertPayload.type}`,
          );
        } catch (error) {
          this.logger.error(
            `Error executing rule for member ${member.id}`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Error processing member ${member.id}`,
        error,
      );
    }
  }

  private groupDocumentsByMember(
    documents: MedicalDocument[],
  ): Map<string, MedicalDocument[]> {
    return documents.reduce((accumulator, document) => {
      const memberDocuments = accumulator.get(document.memberUserId) ?? [];
      memberDocuments.push(document);
      accumulator.set(document.memberUserId, memberDocuments);
      return accumulator;
    }, new Map<string, MedicalDocument[]>());
  }

  private getAlertRules(): IAlertRule[] {
    return [
      this.expiringRule,
      this.expiredRule,
    ];
  }

}
