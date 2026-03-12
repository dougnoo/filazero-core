import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Infrastructure Entities
import { UserEntity } from './infrastructure/entities/user.entity';
import { DoctorEntity } from './infrastructure/entities/doctor.entity';

// Repository Tokens
import { USER_REPOSITORY_TOKEN } from './domain/repositories/user.repository.token';
import { USER_DB_REPOSITORY_TOKEN } from './domain/repositories/user-db.repository.token';
import { DOCTOR_REPOSITORY_TOKEN } from './domain/repositories/doctor.repository.token';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../shared/domain/repositories/notification.repository.token';

// Repository Implementations
import { CognitoUserRepository } from './infrastructure/repositories/cognito-user.repository';
import { TypeORMUserDbRepository } from './infrastructure/repositories/typeorm-user-db.repository';
import { TypeORMDoctorRepository } from './infrastructure/repositories/typeorm-doctor.repository';
import { ConsoleNotificationRepository } from '../../shared/infrastructure/repositories/console-notification.repository';
import { SesNotificationRepository } from '../../shared/infrastructure/repositories/ses-notification.repository';

// Services
import { PasswordGeneratorService } from './application/services/password-generator.service';
import { EmailTemplateService } from '../../shared/infrastructure/services/email-template.service';
import { EmailBrandingService } from '../../shared/infrastructure/services/email-branding.service';
import { S3Service } from '../../shared/infrastructure/services/s3.service';

// Use Cases
import { CreateAdminUseCase } from './application/use-cases/create-admin/create-admin.use-case';
import { CreateDoctorUseCase } from './application/use-cases/create-doctor/create-doctor.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users/list-users.use-case';
import { GetUserUseCase } from './application/use-cases/get-user/get-user.use-case';
import { ListDoctorsUseCase } from './application/use-cases/list-doctors/list-doctors.use-case';
import { GetDoctorUseCase } from './application/use-cases/get-doctor/get-doctor.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user/update-user.use-case';
import { UpdateDoctorUseCase } from './application/use-cases/update-doctor/update-doctor.use-case';
import { DeactivateUserUseCase } from './application/use-cases/deactivate-user/deactivate-user.use-case';
import { ActivateUserUseCase } from './application/use-cases/activate-user/activate-user.use-case';
import { UploadProfilePictureUseCase } from './application/use-cases/upload-profile-picture/upload-profile-picture.use-case';
import { ConfirmProfilePictureUseCase } from './application/use-cases/confirm-profile-picture/confirm-profile-picture.use-case';
import { DeleteProfilePictureUseCase } from './application/use-cases/delete-profile-picture/delete-profile-picture.use-case';

// Controllers
import { UsersController } from './presentation/controllers/users.controller';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, DoctorEntity]),
    ConfigModule,
    forwardRef(() => AuthModule),
  ],
  providers: [
    // Cognito Repository
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: CognitoUserRepository,
    },
    // PostgreSQL Repositories
    {
      provide: USER_DB_REPOSITORY_TOKEN,
      useClass: TypeORMUserDbRepository,
    },
    {
      provide: DOCTOR_REPOSITORY_TOKEN,
      useClass: TypeORMDoctorRepository,
    },
    // Notification Repository (conditional based on environment)
    {
      provide: NOTIFICATION_REPOSITORY_TOKEN,
      useFactory: (
        configService: ConfigService,
        emailTemplateService: EmailTemplateService,
      ) => {
        const service = configService.get('app.notificationService', 'console');
        return service === 'ses'
          ? new SesNotificationRepository(configService, emailTemplateService)
          : new ConsoleNotificationRepository();
      },
      inject: [ConfigService, EmailTemplateService],
    },
    // Services
    PasswordGeneratorService,
    EmailBrandingService,
    EmailTemplateService,
    S3Service,
    // Use Cases
    CreateAdminUseCase,
    CreateDoctorUseCase,
    ListUsersUseCase,
    GetUserUseCase,
    ListDoctorsUseCase,
    GetDoctorUseCase,
    UpdateUserUseCase,
    UpdateDoctorUseCase,
    DeactivateUserUseCase,
    ActivateUserUseCase,
    UploadProfilePictureUseCase,
    ConfirmProfilePictureUseCase,
    DeleteProfilePictureUseCase,
  ],
  controllers: [UsersController],
  exports: [
    USER_REPOSITORY_TOKEN,
    USER_DB_REPOSITORY_TOKEN,
    DOCTOR_REPOSITORY_TOKEN,
  ],
})
export class UsersModule {}
