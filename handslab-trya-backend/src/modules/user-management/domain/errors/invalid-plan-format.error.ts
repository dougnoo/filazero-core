import { DomainError } from './domain.error';

export class InvalidPlanFormatError extends DomainError {
  constructor(public readonly planName: string) {
    super(`Formato inválido do plano: ${planName}`);
    this.name = 'InvalidPlanFormatError';
  }
}
