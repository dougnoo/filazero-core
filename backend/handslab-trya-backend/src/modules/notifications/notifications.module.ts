import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { NotificationsController } from './presentation/controllers/notifications.controller';
import { ProcessNotificationUseCase } from './application/use-cases/process-notification.use-case';
import { NotificationRepository } from './infrastructure/repositories/notification.repository';
import { TriageSessionRepository } from './infrastructure/repositories/triage-session.repository';
import { NOTIFICATION_REPOSITORY_TOKEN } from './domain/interfaces/notification.repository.interface';
import { TRIAGE_SESSION_REPOSITORY_TOKEN } from './domain/interfaces/triage-session.repository.interface';
import { Notification } from '../../database/entities/notification.entity';
import { DynamoDBProvider } from '../../shared/infrastructure/providers/dynamodb.provider';
import { PlatformApiModule } from '../platform-api/platform-api.module';
import { ListNotificationsUseCase } from './application/use-cases/list-notifications.use-case';
import { GetLatestUnreadNotificationUseCase } from './application/use-cases/get-latest-unread-notification.use-case';
import { MarkNotificationAsReadUseCase } from './application/use-cases/mark-notification-as-read.use-case';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Notification]),
    PlatformApiModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [NotificationsController],
  providers: [
    ProcessNotificationUseCase,
    ListNotificationsUseCase,
    GetLatestUnreadNotificationUseCase,
    MarkNotificationAsReadUseCase,
    DynamoDBProvider,
    {
      provide: NOTIFICATION_REPOSITORY_TOKEN,
      useClass: NotificationRepository,
    },
    {
      provide: TRIAGE_SESSION_REPOSITORY_TOKEN,
      useClass: TriageSessionRepository,
    },
  ],
})
export class NotificationsModule {}
