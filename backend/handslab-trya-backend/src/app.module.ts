import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserManagementModule } from './modules/user-management/user-management.module';
import { PublicConfigModule } from './modules/public-config/public-config.module';
import { OnboardModule } from './modules/onboard/onboard.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { HealthOperatorsModule } from './modules/health-operators/health-operators.module';
import { HealthPlansModule } from './modules/health-plans/health-plans.module';
import { TermsModule } from './modules/terms/terms.module';
import { TutorialsModule } from './modules/tutorials/tutorials.module';
import { MedicalCertificatesModule } from './modules/medical-certificates/medical-certificates.module';
import { ChatModule } from './modules/chat/chat.module';
import { PlatformApiModule } from './modules/platform-api/platform-api.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FaqModule } from './modules/faq/faq.module';
import { SharedModule } from './shared/shared.module';
import { JwtAuthGuard } from './modules/auth/presentation/guards/jwt-auth.guard';
import { TenantGuard } from './shared/presentation/tenant.guard';
import { RolesGuard } from './shared/presentation/roles.guard';
import awsConfig from './config/aws.config';
import appConfig from './config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { NetworkProvidersModule } from './modules/network-providers/network-providers.module';
import { TriageStatusModule } from './modules/triage-status/triage-status.module';
import { ContactModule } from './modules/contact/contact.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { InsightsModule } from './modules/insights/insights.module';
import { FamilyManagementModule } from './modules/family-management/family-management.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [awsConfig, appConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    SharedModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: Number(process.env.POSTGRES_PORT || 5432),
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        database: process.env.POSTGRES_DB || 'handslab_trya',
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: process.env.MIGRATIONS_RUN !== 'false', // Desabilitar via env var
        migrations: [__dirname + '/database/migrations/*.js'],
        ssl: process.env.POSTGRES_HOST?.includes('rds.amazonaws.com')
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),
    AuthModule,
    UserManagementModule,
    PublicConfigModule,
    OnboardModule,
    TenantModule,
    HealthOperatorsModule,
    HealthPlansModule,
    TermsModule,
    TutorialsModule,
    MedicalCertificatesModule,
    ChatModule,
    PlatformApiModule,
    NotificationsModule,
    FaqModule,
    IntegrationsModule,
    NetworkProvidersModule,
    TriageStatusModule,
    ContactModule,
    DocumentsModule,
    TimelineModule,
    FamilyManagementModule,
    InsightsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guards globais aplicados em ordem
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
