import { Inject, Injectable, Logger } from '@nestjs/common';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { OTP_REPOSITORY_TOKEN } from '../../../domain/repositories/otp.repository.token';
import type { IOtpRepository } from '../../../domain/repositories/otp.repository.interface';
import { ConfirmForgotPasswordDto } from './confirm-forgot-password.dto';
import { InvalidOtpError } from '../../../domain/errors/invalid-otp.error';
import { OtpType } from '../../../domain/value-objects/otp-type.enum';

@Injectable()
export class ConfirmForgotPasswordUseCase {
  private readonly logger = new Logger(ConfirmForgotPasswordUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(OTP_REPOSITORY_TOKEN)
    private readonly otpRepository: IOtpRepository,
  ) {}

  async execute(dto: ConfirmForgotPasswordDto): Promise<void> {
    this.logger.log(`Confirmando redefinição de senha para ${dto.email}`);

    // Validar OTP antes de confirmar a redefinição
    const isValidOtp = await this.otpRepository.validateOtp(
      dto.email,
      dto.code,
      OtpType.PASSWORD_RESET,
    );

    if (!isValidOtp) {
      this.logger.warn(`OTP inválido para redefinição de senha: ${dto.email}`);
      throw new InvalidOtpError('Código OTP inválido ou expirado');
    }

    this.logger.log(
      `OTP válido para ${dto.email}, alterando senha diretamente`,
    );

    // Alterar senha diretamente usando Admin API (não usa o código do Cognito)
    await this.authRepository.changeUserPassword(dto.email, dto.newPassword);

    this.logger.log(`Senha alterada com sucesso para ${dto.email}`);
  }
}
