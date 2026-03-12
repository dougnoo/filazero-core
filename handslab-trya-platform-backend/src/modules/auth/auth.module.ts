import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AUTH_REPOSITORY_TOKEN } from './domain/repositories/auth.repository.interface';
import { OTP_REPOSITORY_TOKEN } from './domain/repositories/otp.repository.token';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../shared/domain/repositories/notification.repository.token';
import { CognitoAuthRepository } from './infrastructure/repositories/cognito-auth.repository';
import { DynamoDbOtpRepository } from './infrastructure/repositories/dynamodb-otp.repository';
import { SesNotificationRepository } from '../../shared/infrastructure/repositories/ses-notification.repository';
import { ConsoleNotificationRepository } from '../../shared/infrastructure/repositories/console-notification.repository';
import { EmailTemplateService } from '../../shared/infrastructure/services/email-template.service';
import { EmailBrandingService } from '../../shared/infrastructure/services/email-branding.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { SignInUseCase } from './application/use-cases/sign-in/sign-in.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token/refresh-token.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password/forgot-password.use-case';
import { ConfirmForgotPasswordUseCase } from './application/use-cases/confirm-forgot-password/confirm-forgot-password.use-case';
import { CompleteNewPasswordUseCase } from './application/use-cases/complete-new-password/complete-new-password.use-case';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user/get-current-user.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile/update-profile.use-case';
import { VerifyOtpUseCase } from './application/use-cases/verify-otp/verify-otp.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password/change-password.use-case';
import { UpdatePasswordUseCase } from './application/use-cases/update-password/update-password.use-case';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { RolesGuard } from './presentation/guards/roles.guard';
import { AuthController } from './presentation/controllers/auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: parseInt(
            configService.get<string>('jwt.expiresIn', '3600'),
            10,
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: AUTH_REPOSITORY_TOKEN,
      useClass: CognitoAuthRepository,
    },
    {
      provide: OTP_REPOSITORY_TOKEN,
      useClass: DynamoDbOtpRepository,
    },
    {
      provide: NOTIFICATION_REPOSITORY_TOKEN,
      useFactory: (
        configService: ConfigService,
        emailTemplateService: EmailTemplateService,
      ) => {
        const service = configService.get<string>(
          'app.notificationService',
          'console',
        );
        if (service === 'ses') {
          return new SesNotificationRepository(
            configService,
            emailTemplateService,
          );
        }
        return new ConsoleNotificationRepository();
      },
      inject: [ConfigService, EmailTemplateService],
    },
    EmailBrandingService,
    EmailTemplateService,
    JwtStrategy,
    SignInUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    ConfirmForgotPasswordUseCase,
    CompleteNewPasswordUseCase,
    GetCurrentUserUseCase,
    UpdateProfileUseCase,
    VerifyOtpUseCase,
    ChangePasswordUseCase,
    UpdatePasswordUseCase,
    JwtAuthGuard,
    RolesGuard,
  ],
  controllers: [AuthController],
  exports: [
    JwtAuthGuard,
    RolesGuard,
    VerifyOtpUseCase,
    GetCurrentUserUseCase,
    OTP_REPOSITORY_TOKEN,
    NOTIFICATION_REPOSITORY_TOKEN,
  ],
})
export class AuthModule {}
