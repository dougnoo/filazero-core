import { DomainError } from './domain.error';

export class BucketNotConfiguredError extends DomainError {
  constructor(tenantName: string) {
    super(`Bucket não configurado para o tenant: ${tenantName}`);
  }
}
