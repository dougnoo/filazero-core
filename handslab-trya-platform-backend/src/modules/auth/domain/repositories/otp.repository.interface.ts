import { OtpType } from '../value-objects/otp-type.enum';

export interface IOtpRepository {
  /**
   * Gera um código OTP de 6 dígitos
   */
  generateOtp(): string;

  /**
   * Armazena o código OTP associado a um email com expiração
   * @param email - Email do usuário
   * @param otp - Código OTP gerado
   * @param expiresInSeconds - Tempo de expiração em segundos (padrão: 300 = 5 minutos)
   * @param type - Tipo do OTP (primeiro login ou redefinição de senha)
   */
  storeOtp(
    email: string,
    otp: string,
    expiresInSeconds?: number,
    type?: OtpType,
  ): Promise<void>;

  /**
   * Valida se o código OTP é válido para o email e tipo específico
   * @param email - Email do usuário
   * @param otp - Código OTP a validar
   * @param expectedType - Tipo esperado do OTP
   * @returns true se o OTP for válido e do tipo correto, false caso contrário
   */
  validateOtp(
    email: string,
    otp: string,
    expectedType?: OtpType,
  ): Promise<boolean>;

  /**
   * Verifica se o código OTP é válido para o email e tipo específico (sem consumir)
   * @param email - Email do usuário
   * @param otp - Código OTP a validar
   * @param expectedType - Tipo esperado do OTP
   * @returns Informações do OTP se válido, null caso contrário
   */
  validateOtpWithoutConsuming(
    email: string,
    otp: string,
    expectedType?: OtpType,
  ): Promise<{ expiresAt: string; type: string } | null>;
}
