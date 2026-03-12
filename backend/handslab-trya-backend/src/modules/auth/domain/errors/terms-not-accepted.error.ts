import { MissingTermAcceptanceDto } from '../../../terms/application/use-cases/check-term-acceptance/missing-term-acceptance.dto';

export class TermsNotAcceptedError extends Error {
  constructor(public readonly missingTerms: MissingTermAcceptanceDto[]) {
    super('User must accept terms before login');
    this.name = 'TermsNotAcceptedError';
  }
}
