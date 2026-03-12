import type { MagicLinkResult } from './magic-link-result.interface';

import type { ConsultationResult } from './consultation-result.interface';

export interface ITelemedicineStrategy {
  generateMagicLink(
    cpf: string,
    userName: string,
    userEmail: string,
  ): Promise<MagicLinkResult>;

  getConsultationHistory(
    cpf: string,
    limit?: number,
  ): Promise<ConsultationResult[]>;
}
