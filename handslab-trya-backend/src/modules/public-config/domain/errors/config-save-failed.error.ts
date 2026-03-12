import { DomainError } from './domain.error';

export class ConfigSaveFailedError extends DomainError {
  constructor(tenantName: string, configKey: string, originalError?: string) {
    const details = originalError ? `: ${originalError}` : '';
    super(
      `Falha ao salvar configuração '${configKey}' para o tenant '${tenantName}'${details}`,
    );
  }
}
