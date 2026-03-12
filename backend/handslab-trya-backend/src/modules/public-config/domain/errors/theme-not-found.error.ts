import { DomainError } from './domain.error';

export class ThemeNotFoundError extends DomainError {
  constructor(tenantName: string) {
    super(`Tema não encontrado para o tenant: ${tenantName}`);
  }
}
