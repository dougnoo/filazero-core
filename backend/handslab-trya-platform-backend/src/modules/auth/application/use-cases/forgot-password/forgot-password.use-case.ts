import { Inject, Injectable, Logger } from '@nestjs/common';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { OTP_REPOSITORY_TOKEN } from '../../../domain/repositories/otp.repository.token';
import type { IOtpRepository } from '../../../domain/repositories/otp.repository.interface';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../../../../shared/domain/repositories/notification.repository.token';
import type { INotificationRepository } from '../../../../../shared/domain/repositories/notification.repository.interface';
import { ForgotPasswordDto } from './forgot-password.dto';
import { OtpType } from '../../../domain/value-objects/otp-type.enum';
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(OTP_REPOSITORY_TOKEN)
    private readonly otpRepository: IOtpRepository,
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<void> {
    // Verificar se o usuário existe
    const userExists = await this.authRepository.userExists(dto.email);
    if (!userExists) {
      this.logger.warn(
        `Tentativa de redefinição para usuário inexistente: ${dto.email}`,
      );
      throw new UserNotFoundError('Usuário não encontrado com este email');
    }

    this.logger.log(`Solicitação de redefinição de senha para ${dto.email}`);

    // Gerar código OTP
    const otp = this.otpRepository.generateOtp();

    // Armazenar OTP com expiração de 10 minutos
    await this.otpRepository.storeOtp(
      dto.email,
      otp,
      600, // 10 minutos
      OtpType.PASSWORD_RESET,
    );

    // Enviar email com OTP (com branding do tenant se disponível)
    await this.notificationRepository.sendPasswordResetEmail(
      dto.email,
      otp,
      dto.tenantName,
    );

    this.logger.log(`OTP de redefinição de senha enviado para ${dto.email}`);
  }
}
