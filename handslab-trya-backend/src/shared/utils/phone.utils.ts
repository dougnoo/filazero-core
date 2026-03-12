import { InvalidPhoneFormatError } from '../../modules/auth/domain/errors/invalid-phone-format.error';

export class PhoneUtils {
  static formatBrazilianPhone(phone?: string): string | undefined {
    if (!phone || !phone.trim()) {
      return undefined;
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // Celular: 11 dígitos (DDD + 9 + 8 dígitos)
    // Telefone fixo: 10 dígitos (DDD + 8 dígitos)
    if (cleanPhone.length === 11 && cleanPhone[2] === '9') {
      return `+55${cleanPhone}`;
    }
    if (cleanPhone.length === 10 && cleanPhone[2] !== '9') {
      return `+55${cleanPhone}`;
    }

    throw new InvalidPhoneFormatError(
      'Telefone deve ter 10 dígitos (fixo) ou 11 dígitos (celular)',
    );
  }
}
