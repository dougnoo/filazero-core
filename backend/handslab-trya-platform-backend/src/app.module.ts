import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import awsConfig from './config/aws.config';
import jwtConfig from './config/jwt.config';
import databaseConfig from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MedicalApprovalRequestsModule } from './modules/medical-approval-requests/medical-approval-requests.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { NetworkProvidersModule } from './modules/network-providers/network-providers.module';
import { CrmValidatorModule } from './modules/crm-validator/crm-validator.module';
import { JwtAuthGuard } from './modules/auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/presentation/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, awsConfig, jwtConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        schema: configService.get('database.schema'),
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: true,
        migrations: [__dirname + '/database/migrations/*.js'],
        logging: configService.get('app.environment') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    MedicalApprovalRequestsModule,
    PrescriptionsModule,
    NetworkProvidersModule,
    CrmValidatorModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
