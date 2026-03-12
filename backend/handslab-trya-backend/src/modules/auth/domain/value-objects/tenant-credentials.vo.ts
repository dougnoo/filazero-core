import { InvalidCredentialsError } from '../errors/invalid-credentials.error';

/**
 * Value Object para credenciais com tenant
 * Usado quando o tenant precisa ser especificado no login
 */
export class TenantCredentials {
  private constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly tenantId?: string,
  ) {}

  public static create(
    email: string,
    password: string,
    tenantId?: string,
  ): TenantCredentials {
    if (!email || !email.includes('@')) {
      throw new InvalidCredentialsError('Email inválido');
    }

    if (!password || password.length < 8) {
      throw new InvalidCredentialsError(
        'Senha deve ter no mínimo 8 caracteres',
      );
    }

    // Validar tenantId se fornecido
    if (tenantId && tenantId.trim().length === 0) {
      throw new InvalidCredentialsError('Tenant ID inválido');
    }

    return new TenantCredentials(
      email.toLowerCase().trim(),
      password,
      tenantId?.trim(),
    );
  }

  /**
   * Verifica se as credenciais incluem tenantId
   */
  public hasTenantId(): boolean {
    return !!this.tenantId;
  }
}
