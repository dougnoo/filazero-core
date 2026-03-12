import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimelineEvent } from '../../database/entities/timeline-event.entity';
import { User } from '../../database/entities/user.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { MedicalDocument } from '../../database/entities/medical-document.entity';
import { AuthModule } from '../auth/auth.module';
import { TimelineController } from './presentation/controllers/timeline.controller';
import { TypeOrmTimelineRepository } from './infrastructure/repositories/typeorm-timeline.repository';
import { TIMELINE_REPOSITORY_TOKEN } from './domain/timeline.repository.interface';
import { ListTimelineUseCase } from './application/use-cases/list-timeline.use-case';
import { TimelineService } from './application/services/timeline.service';
import { GenerateHealthAlertsUseCase } from './application/use-cases/generate-health-alerts.use-case';
import {
  DOCUMENT_EXPIRING_RULE_TOKEN,
  DOCUMENT_EXPIRED_RULE_TOKEN,
} from './domain/alerts/alert-rule.interface';
import { DocumentExpiringRule } from './domain/alerts/document-expiring.rule';
import { DocumentExpiredRule } from './domain/alerts/document-expired.rule';
import {
  HEALTH_ALERT_SOURCE_REPOSITORY_TOKEN,
} from './domain/health-alert-source.repository.interface';
import { TypeOrmHealthAlertSourceRepository } from './infrastructure/repositories/typeorm-health-alert-source.repository';
import {
  ALERT_DEDUPLICATION_POLICY_TOKEN,
  DefaultAlertDeduplicationPolicy,
} from './application/policies/alert-deduplication.policy';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimelineEvent, User, Tenant, MedicalDocument]),
    forwardRef(() => AuthModule),
  ],
  controllers: [TimelineController],
  providers: [
    {
      provide: TIMELINE_REPOSITORY_TOKEN,
      useClass: TypeOrmTimelineRepository,
    },
    {
      provide: HEALTH_ALERT_SOURCE_REPOSITORY_TOKEN,
      useClass: TypeOrmHealthAlertSourceRepository,
    },
    {
      provide: ALERT_DEDUPLICATION_POLICY_TOKEN,
      useClass: DefaultAlertDeduplicationPolicy,
    },
    // Alert rules (Currently only document expiring/expired rules are active)
    // Future: MissingVaccinationRule and MissingExamRule will be added when ready
    {
      provide: DOCUMENT_EXPIRING_RULE_TOKEN,
      useClass: DocumentExpiringRule,
    },
    {
      provide: DOCUMENT_EXPIRED_RULE_TOKEN,
      useClass: DocumentExpiredRule,
    },
    // Use cases and services
    ListTimelineUseCase,
    TimelineService,
    GenerateHealthAlertsUseCase,
  ],
  exports: [
    TIMELINE_REPOSITORY_TOKEN,
    HEALTH_ALERT_SOURCE_REPOSITORY_TOKEN,
    TimelineService,
    GenerateHealthAlertsUseCase,
  ],
})
export class TimelineModule {}
