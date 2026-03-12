import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './presentation/controllers/auth.controller';
import { SignInUseCase } from './application/use-cases/sign-in/sign-in.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token/refresh-token.use-case';
import { SignOutUseCase } from './application/use-cases/sign-out/sign-out.use-case';
import { GetUserInfoUseCase } from './application/use-cases/get-user-info/get-user-info.use-case';
import { GetUserInfoByIdUseCase } from './application/use-cases/get-user-info/get-user-info-by-id.use-case';
import { CompleteNewPasswordUseCase } from './application/use-cases/complete-new-password/complete-new-password.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password/reset-password.use-case';
import { VerifyOtpUseCase } from './application/use-cases/verify-otp/verify-otp.use-case';
import { GetAuthorizationUrlUseCase } from './application/use-cases/get-authorization-url/get-authorization-url.use-case';
import { OAuthCallbackUseCase } from './application/use-cases/oauth-callback/oauth-callback.use-case';
import { VerifyCpfUseCase } from './application/use-cases/verify-cpf/verify-cpf.use-case';
import { VerifyBirthdateUseCase } from './application/use-cases/verify-birthdate/verify-birthdate.use-case';
import { CompleteRegistrationUseCase } from './application/use-cases/complete-registration/complete-registration.use-case';
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { CognitoAuthRepository } from './infrastructure/repositories/cognito-auth.repository';
import { InMemoryOtpRepository } from './infrastructure/repositories/in-memory-otp.repository';
import { DynamoDbOtpRepository } from './infrastructure/repositories/dynamodb-otp.repository';
import { ConsoleNotificationRepository } from './infrastructure/repositories/console-notification.repository';
import { SesNotificationRepository } from './infrastructure/repositories/ses-notification.repository';
import { EmailTemplateService } from './infrastructure/templates/email-template.service';
import { EmailBrandingService } from './infrastructure/services/email-branding.service';
import { OnboardingTokenService } from './infrastructure/services/onboarding-token.service';
import { AUTH_REPOSITORY_TOKEN } from './domain/repositories/auth.repository.token';
import { OTP_REPOSITORY_TOKEN } from './domain/repositories/otp.repository.token';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../shared/domain/repositories/notification.repository.token';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { TermsModule } from '../terms/terms.module';
import { UserManagementModule } from '../user-management/user-management.module';
import { TenantModule } from '../tenant/tenant.module';
import { PublicConfigModule } from '../public-config/public-config.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.jwt.secret'),
        signOptions: { expiresIn: '10m' },
      }),
      inject: [ConfigService],
    }),

    TermsModule,
    TenantModule,
    PublicConfigModule,
    forwardRef(() => UserManagementModule),
  ],
  controllers: [AuthController],
  providers: [
    // Use Cases
    SignInUseCase,
    RefreshTokenUseCase,
    SignOutUseCase,
    GetUserInfoUseCase,
    GetUserInfoByIdUseCase,
    CompleteNewPasswordUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    VerifyOtpUseCase,
    GetAuthorizationUrlUseCase,
    OAuthCallbackUseCase,
    VerifyCpfUseCase,
    VerifyBirthdateUseCase,
    CompleteRegistrationUseCase,
    { provide: 'VERIFY_CPF_USE_CASE', useClass: VerifyCpfUseCase },
    { provide: 'VERIFY_BIRTHDATE_USE_CASE', useClass: VerifyBirthdateUseCase },
    {
      provide: 'COMPLETE_REGISTRATION_USE_CASE',
      useClass: CompleteRegistrationUseCase,
    },

    // Mappers
    UserMapper,

    // Services
    EmailBrandingService,
    EmailTemplateService,
    OnboardingTokenService,

    // Guards
    JwtAuthGuard,

    // Repositories
    {
      provide: AUTH_REPOSITORY_TOKEN,
      useClass: CognitoAuthRepository,
    },
    {
      provide: OTP_REPOSITORY_TOKEN,
      useFactory: (configService: ConfigService) => {
        const storage = configService.get<string>('app.otp.storage', 'memory');
        if (storage === 'dynamodb') {
          return new DynamoDbOtpRepository(configService);
        }
        return new InMemoryOtpRepository();
      },
      inject: [ConfigService],
    },
    {
      provide: NOTIFICATION_REPOSITORY_TOKEN,
      useFactory: (
        configService: ConfigService,
        emailTemplateService: EmailTemplateService,
        emailBrandingService: EmailBrandingService,
      ) => {
        const service = configService.get<string>(
          'app.notification.service',
          'console',
        );
        if (service === 'ses') {
          return new SesNotificationRepository(
            configService,
            emailTemplateService,
            emailBrandingService,
          );
        }
        return new ConsoleNotificationRepository();
      },
      inject: [ConfigService, EmailTemplateService, EmailBrandingService],
    },
  ],
  exports: [
    SignInUseCase,
    RefreshTokenUseCase,
    SignOutUseCase,
    GetUserInfoUseCase,
    GetUserInfoByIdUseCase,
    CompleteNewPasswordUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    VerifyOtpUseCase,
    GetAuthorizationUrlUseCase,
    OAuthCallbackUseCase,
    UserMapper,
    JwtAuthGuard,
    AUTH_REPOSITORY_TOKEN,
    OTP_REPOSITORY_TOKEN,
    NOTIFICATION_REPOSITORY_TOKEN,
  ],
})
export class AuthModule {}
