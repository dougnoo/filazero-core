import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IOtpRepository } from '../../../domain/repositories/otp.repository.interface';
import { OTP_REPOSITORY_TOKEN } from '../../../domain/repositories/otp.repository.token';
import { OtpType } from '../../../domain/value-objects/otp-type.enum';
import { VerifyOtpDto } from './verify-otp.dto';
import { VerifyOtpResponseDto } from './verify-otp-response.dto';
import { InvalidOtpError } from '../../../domain/errors/invalid-otp.error';

@Injectable()
export class VerifyOtpUseCase {
  private readonly logger = new Logger(VerifyOtpUseCase.name);

  constructor(
    @Inject(OTP_REPOSITORY_TOKEN)
    private readonly otpRepository: IOtpRepository,
  ) {}

  async execute(
    dto: VerifyOtpDto,
    expectedType?: OtpType,
  ): Promise<VerifyOtpResponseDto> {
    this.logger.log(`Verificando OTP para ${dto.email}`);

    const isValid = await this.otpRepository.validateOtp(
      dto.email,
      dto.otp,
      expectedType,
    );

    if (!isValid) {
      this.logger.warn(`OTP inválido para ${dto.email}`);
      throw new InvalidOtpError('Código OTP inválido ou expirado');
    }

    this.logger.log(`OTP válido para ${dto.email}`);

    return {
      isValid: true,
      message: 'OTP válido',
    };
  }
}
