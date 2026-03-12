import { Inject, Injectable } from '@nestjs/common';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.token';
import type { IOtpRepository } from '../../../domain/repositories/otp.repository.interface';
import { OTP_REPOSITORY_TOKEN } from '../../../domain/repositories/otp.repository.token';
import { OtpType } from '../../../domain/value-objects/otp-type.enum';
import { CompleteNewPasswordDto } from './complete-new-password.dto';
import { CompleteNewPasswordResponseDto } from './complete-new-password-response.dto';
import { InvalidOtpError } from '../../../domain/errors/invalid-otp.error';
import { TenantMismatchError } from '../../../domain/errors/tenant-mismatch.error';

@Injectable()
export class CompleteNewPasswordUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(OTP_REPOSITORY_TOKEN)
    private readonly otpRepository: IOtpRepository,
  ) {}

  async execute(
    dto: CompleteNewPasswordDto,
  ): Promise<CompleteNewPasswordResponseDto> {
    // Validar código OTP para primeiro login
    const isOtpValid = await this.otpRepository.validateOtp(
      dto.email,
      dto.otpCode,
      OtpType.FIRST_LOGIN,
    );

    if (!isOtpValid) {
      throw new InvalidOtpError();
    }

    // Completar o challenge NEW_PASSWORD_REQUIRED
    const { tokens, user } =
      await this.authRepository.completeNewPasswordChallenge(
        dto.email,
        dto.newPassword,
        dto.session,
      );

    // Validar tenant se fornecido no DTO
    if (dto.tenantId && user.tenantId !== dto.tenantId) {
      throw new TenantMismatchError();
    }

    // Retornar DTO de resposta
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }
}
