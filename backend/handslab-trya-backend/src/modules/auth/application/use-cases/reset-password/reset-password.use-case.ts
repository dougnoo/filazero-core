import { Inject, Injectable } from '@nestjs/common';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.token';
import type { IOtpRepository } from '../../../domain/repositories/otp.repository.interface';
import { OTP_REPOSITORY_TOKEN } from '../../../domain/repositories/otp.repository.token';
import { OtpType } from '../../../domain/value-objects/otp-type.enum';
import { ResetPasswordDto } from './reset-password.dto';
import { ResetPasswordResponseDto } from './reset-password-response.dto';
import { ResetPasswordError } from '../../../domain/errors/reset-password.error';
import { InvalidVerificationCodeError } from '../../../domain/errors/invalid-verification-code.error';
import { UserNotFoundError } from '../../../../../shared/domain/errors/user-not-found.error';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(OTP_REPOSITORY_TOKEN)
    private readonly otpRepository: IOtpRepository,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    try {
      // Verificar se o usuário existe
      const userExists = await this.authRepository.userExists(dto.email);
      if (!userExists) {
        throw new UserNotFoundError('Usuário não encontrado com este email');
      }

      // Verificar se o código OTP é válido para redefinição de senha
      const isValidOtp = await this.otpRepository.validateOtp(
        dto.email,
        dto.verificationCode,
        OtpType.PASSWORD_RESET,
      );

      if (!isValidOtp) {
        throw new InvalidVerificationCodeError(
          'Código de verificação inválido ou expirado',
        );
      }

      // Alterar senha diretamente no Cognito usando Admin API
      await this.authRepository.changeUserPassword(dto.email, dto.newPassword);

      return {
        message: 'Senha redefinida com sucesso',
        success: true,
      };
    } catch (error) {
      if (
        error instanceof UserNotFoundError ||
        error instanceof InvalidVerificationCodeError
      ) {
        throw error;
      }

      throw new ResetPasswordError(`Erro ao redefinir senha: ${error.message}`);
    }
  }
}
