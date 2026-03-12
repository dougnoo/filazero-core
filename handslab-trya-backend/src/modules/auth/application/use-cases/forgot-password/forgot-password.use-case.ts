import { Inject, Injectable } from '@nestjs/common';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.token';
import type { IOtpRepository } from '../../../domain/repositories/otp.repository.interface';
import { OTP_REPOSITORY_TOKEN } from '../../../domain/repositories/otp.repository.token';
import type { INotificationRepository } from '../../../../../shared/domain/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../../../../shared/domain/repositories/notification.repository.token';
import { OtpType } from '../../../domain/value-objects/otp-type.enum';
import { ForgotPasswordDto } from './forgot-password.dto';
import { ForgotPasswordResponseDto } from './forgot-password-response.dto';
import { ForgotPasswordError } from '../../../domain/errors/forgot-password.error';
import { UserNotFoundError } from '../../../../../shared/domain/errors/user-not-found.error';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(OTP_REPOSITORY_TOKEN)
    private readonly otpRepository: IOtpRepository,
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    try {
      // Verificar se o usuário existe
      const userExists = await this.authRepository.userExists(dto.email);
      if (!userExists) {
        throw new UserNotFoundError('Usuário não encontrado com este email');
      }

      // Validar tenant se fornecido
      // Nota: Esta validação pode ser expandida conforme necessário
      // Por enquanto, assumimos que o repositório já valida o tenant

      // Gerar código OTP para verificação
      const otp = this.otpRepository.generateOtp();

      // Armazenar OTP com expiração de 10 minutos para redefinição de senha
      await this.otpRepository.storeOtp(
        dto.email,
        otp,
        600,
        OtpType.PASSWORD_RESET,
      );

      // Enviar código por email (com branding do tenant se disponível)
      await this.notificationRepository.sendPasswordResetEmail(
        dto.email,
        otp,
        dto.tenantName,
      );

      return {
        message: 'Código de verificação enviado para o email',
        success: true,
      };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }

      throw new ForgotPasswordError(
        `Erro ao solicitar redefinição de senha: ${error.message}`,
      );
    }
  }
}
