export class FaqQuestion {
  private constructor(
    public readonly message: string,
    public readonly category: FaqCategory,
  ) {}

  static create(message: string, category: FaqCategory): FaqQuestion {
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }
    return new FaqQuestion(message, category);
  }
}

export enum FaqCategory {
  GENERAL = 'GENERAL',
  TRIAGE_AI = 'TRIAGE_AI',
  ACCREDITED_NETWORKS = 'ACCREDITED_NETWORKS',
  CERTIFICATES = 'CERTIFICATES',
}
