import { Injectable, Logger } from '@nestjs/common';
import { IOtpRepository } from '../../domain/repositories/otp.repository.interface';
import { OtpType } from '../../domain/value-objects/otp-type.enum';

interface OtpData {
  code: string;
  expiresAt: Date;
  type: OtpType;
}

/**
 * Implementação em memória do repositório de OTP
 *
 * NOTA: Esta implementação usa memória local e não é adequada para produção
 * em ambientes com múltiplas instâncias. Para produção, use Redis.
 *
 * Em produção, considere usar:
 * - Redis com TTL automático
 * - AWS DynamoDB com TTL
 * - Outro serviço de cache distribuído
 */
@Injectable()
export class InMemoryOtpRepository implements IOtpRepository {
  private readonly logger = new Logger(InMemoryOtpRepository.name);
  private readonly otpStore = new Map<string, OtpData>();

  // Limpar OTPs expirados a cada minuto
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredOtps();
    }, 60000); // 1 minuto
  }

  generateOtp(): string {
    // Gerar código de 6 dígitos
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.logger.debug(`OTP gerado: ${otp}`);
    return otp;
  }

  async storeOtp(
    email: string,
    otp: string,
    expiresInSeconds: number = 300, // 5 minutos padrão
    type: OtpType = OtpType.FIRST_LOGIN, // Padrão para primeiro login
  ): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    this.otpStore.set(normalizedEmail, {
      code: otp,
      expiresAt,
      type,
    });

    this.logger.log(
      `OTP ${type} armazenado para ${normalizedEmail}, expira em ${expiresAt.toISOString()}`,
    );
  }

  async validateOtp(
    email: string,
    otp: string,
    expectedType?: OtpType,
  ): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const otpData = this.otpStore.get(normalizedEmail);

    if (!otpData) {
      this.logger.warn(`OTP não encontrado para ${normalizedEmail}`);
      return false;
    }

    const now = new Date();
    if (now > otpData.expiresAt) {
      this.logger.warn(`OTP expirado para ${normalizedEmail}`);
      await this.removeOtp(email);
      return false;
    }

    // Verificar se o código OTP está correto
    const isValidOtp = otpData.code === otp;
    if (!isValidOtp) {
      this.logger.warn(`OTP inválido para ${normalizedEmail}`);
      return false;
    }

    // Verificar se o tipo está correto (se especificado)
    if (expectedType && otpData.type !== expectedType) {
      this.logger.warn(
        `Tipo de OTP incorreto para ${normalizedEmail}. Esperado: ${expectedType}, Encontrado: ${otpData.type}`,
      );
      return false;
    }

    this.logger.log(`OTP ${otpData.type} válido para ${normalizedEmail}`);
    // Remover OTP após validação bem-sucedida
    await this.removeOtp(email);
    return true;
  }

  async validateOtpWithoutConsuming(
    email: string,
    otp: string,
    expectedType?: OtpType,
  ): Promise<{ expiresAt: string; type: string } | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const otpData = this.otpStore.get(normalizedEmail);

    if (!otpData) {
      this.logger.debug(`OTP não encontrado para ${normalizedEmail}`);
      return null;
    }

    const now = new Date();
    if (now > otpData.expiresAt) {
      this.logger.debug(`OTP expirado para ${normalizedEmail}`);
      return null;
    }

    // Verificar se o código OTP está correto
    const isValidOtp = otpData.code === otp;
    if (!isValidOtp) {
      this.logger.debug(`OTP inválido para ${normalizedEmail}`);
      return null;
    }

    // Verificar se o tipo está correto (se especificado)
    if (expectedType && otpData.type !== expectedType) {
      this.logger.debug(
        `Tipo de OTP incorreto para ${normalizedEmail}. Esperado: ${expectedType}, Encontrado: ${otpData.type}`,
      );
      return null;
    }

    this.logger.debug(
      `OTP ${otpData.type} válido para ${normalizedEmail} (verificação sem consumo)`,
    );

    // Retornar informações do OTP sem consumir
    return {
      expiresAt: otpData.expiresAt.toISOString(),
      type: otpData.type,
    };
  }

  async removeOtp(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const deleted = this.otpStore.delete(normalizedEmail);

    if (deleted) {
      this.logger.debug(`OTP removido para ${normalizedEmail}`);
    }
  }

  /**
   * Limpa OTPs expirados da memória
   */
  private cleanupExpiredOtps(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [email, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(email);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(
        `Limpeza automática: ${cleanedCount} OTP(s) expirado(s) removido(s)`,
      );
    }
  }

  /**
   * Cleanup quando o serviço é destruído
   */
  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
