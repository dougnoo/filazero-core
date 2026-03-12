import { Inject, Injectable, Logger } from '@nestjs/common';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { OTP_REPOSITORY_TOKEN } from '../../../domain/repositories/otp.repository.token';
import type { IOtpRepository } from '../../../domain/repositories/otp.repository.interface';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../../../../shared/domain/repositories/notification.repository.token';
import type { INotificationRepository } from '../../../../../shared/domain/repositories/notification.repository.interface';
import { SignInDto } from './sign-in.dto';
import { SignInResponseDto } from './sign-in-response.dto';
import { NewPasswordRequiredError } from '../../../domain/errors/new-password-required.error';
import { OtpType } from '../../../domain/value-objects/otp-type.enum';

@Injectable()
export class SignInUseCase {
  private readonly logger = new Logger(SignInUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(OTP_REPOSITORY_TOKEN)
    private readonly otpRepository: IOtpRepository,
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(dto: SignInDto): Promise<SignInResponseDto> {
    const result = await this.authRepository.signIn(dto.email, dto.password);

    // Check if there's a challenge (e.g., NEW_PASSWORD_REQUIRED)
    if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
      this.logger.log(
        `Primeiro acesso detectado para ${dto.email}, gerando OTP`,
      );

      // Gerar código OTP
      const otp = this.otpRepository.generateOtp();

      // Armazenar OTP com expiração de 10 minutos
      await this.otpRepository.storeOtp(
        dto.email,
        otp,
        600, // 10 minutos
        OtpType.FIRST_LOGIN,
      );

      // Enviar email com OTP (com branding do tenant se disponível)
      const userName = result.user?.name || dto.email.split('@')[0];
      await this.notificationRepository.sendOtpEmail(
        dto.email,
        otp,
        userName,
        dto.tenantName,
      );

      this.logger.log(`OTP enviado para ${dto.email}`);

      throw new NewPasswordRequiredError(result.session!, dto.email);
    }

    // Normal authentication flow
    if (!result.tokens || !result.user) {
      throw new Error('Invalid authentication response');
    }

    return new SignInResponseDto(
      result.tokens.accessToken,
      result.tokens.refreshToken,
      result.tokens.expiresIn,
      result.user.id,
      result.user.email,
      result.user.role,
    );
  }
}
