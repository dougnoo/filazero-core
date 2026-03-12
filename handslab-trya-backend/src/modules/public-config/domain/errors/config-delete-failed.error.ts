import { DomainError } from './domain.error';

export class ConfigDeleteFailedError extends DomainError {
  constructor(tenantName: string, configKey: string, originalError?: string) {
    const details = originalError ? `: ${originalError}` : '';
    super(
      `Falha ao deletar configuração '${configKey}' para o tenant '${tenantName}'${details}`,
    );
  }
}
