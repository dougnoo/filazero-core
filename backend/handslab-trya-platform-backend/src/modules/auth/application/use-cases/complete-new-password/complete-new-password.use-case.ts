import { Inject, Injectable, Logger } from '@nestjs/common';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { OTP_REPOSITORY_TOKEN } from '../../../domain/repositories/otp.repository.token';
import type { IOtpRepository } from '../../../domain/repositories/otp.repository.interface';
import { CompleteNewPasswordDto } from './complete-new-password.dto';
import { CompleteNewPasswordResponseDto } from './complete-new-password-response.dto';
import { InvalidOtpError } from '../../../domain/errors/invalid-otp.error';
import { OtpType } from '../../../domain/value-objects/otp-type.enum';

@Injectable()
export class CompleteNewPasswordUseCase {
  private readonly logger = new Logger(CompleteNewPasswordUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(OTP_REPOSITORY_TOKEN)
    private readonly otpRepository: IOtpRepository,
  ) {}

  async execute(
    dto: CompleteNewPasswordDto,
  ): Promise<CompleteNewPasswordResponseDto> {
    this.logger.log(`Completando nova senha para ${dto.email}`);

    // Validar OTP antes de completar a senha
    const isValidOtp = await this.otpRepository.validateOtp(
      dto.email,
      dto.otp,
      OtpType.FIRST_LOGIN,
    );

    if (!isValidOtp) {
      this.logger.warn(`OTP inválido para ${dto.email}`);
      throw new InvalidOtpError('Código OTP inválido ou expirado');
    }

    this.logger.log(`OTP válido para ${dto.email}, completando senha`);

    const { tokens } = await this.authRepository.completeNewPassword(
      dto.email,
      dto.session,
      dto.newPassword,
    );

    return new CompleteNewPasswordResponseDto(
      tokens.accessToken,
      tokens.refreshToken,
      tokens.expiresIn,
    );
  }
}
