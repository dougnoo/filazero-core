import { DomainError } from './domain.error';

export class ConfigFetchFailedError extends DomainError {
  constructor(tenantName: string, configKey: string, originalError?: string) {
    const details = originalError ? `: ${originalError}` : '';
    super(
      `Falha ao buscar configuração '${configKey}' para o tenant '${tenantName}'${details}`,
    );
  }
}
