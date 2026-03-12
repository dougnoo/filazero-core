import { Inject, Injectable } from '@nestjs/common';
import type { IOtpRepository } from '../../../domain/repositories/otp.repository.interface';
import { OTP_REPOSITORY_TOKEN } from '../../../domain/repositories/otp.repository.token';
import { VerifyOtpDto } from './verify-otp.dto';
import { VerifyOtpResponseDto } from './verify-otp-response.dto';
import { InvalidOtpError } from '../../../domain/errors/invalid-otp.error';

@Injectable()
export class VerifyOtpUseCase {
  constructor(
    @Inject(OTP_REPOSITORY_TOKEN)
    private readonly otpRepository: IOtpRepository,
  ) {}

  async execute(dto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    try {
      // Verificar se o OTP existe e é válido (sem consumir)
      const isValid = await this.otpRepository.validateOtpWithoutConsuming(
        dto.email,
        dto.otpCode,
        dto.expectedType, // Passar o tipo esperado
      );

      if (isValid) {
        return {
          isValid: true,
          message: 'Código OTP válido',
          expiresAt: isValid.expiresAt,
          type: isValid.type,
        };
      }

      // Mensagem específica baseada no tipo esperado
      const message = dto.expectedType
        ? `Código OTP inválido, expirado ou não é do tipo ${dto.expectedType}`
        : 'Código OTP inválido ou expirado';

      // Lançar erro de OTP inválido
      throw new InvalidOtpError(message);
    } catch (error) {
      // Se já é uma InvalidOtpError, re-lançar
      if (error instanceof InvalidOtpError) {
        throw error;
      }

      // Para outros erros, lançar como erro interno
      throw new Error(`Erro ao verificar OTP: ${error.message}`);
    }
  }
}
