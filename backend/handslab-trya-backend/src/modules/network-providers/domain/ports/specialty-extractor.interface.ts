export interface SpecialtyExtractionResult {
  specialty: string | null;
  message: string;
}

export interface ISpecialtyExtractor {
  /**
   * Extrai a especialidade médica de uma mensagem de texto
   * @param message Mensagem do usuário
   * @returns Especialidade extraída e mensagem amigável gerada pela IA
   */
  extractSpecialty(message: string): Promise<SpecialtyExtractionResult>;
}

export const SPECIALTY_EXTRACTOR_TOKEN = Symbol('SPECIALTY_EXTRACTOR_TOKEN');
