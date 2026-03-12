import { UrgencyLevel } from './urgency-level.enum';
import { MedicalFinding } from './medical-finding.entity';

/**
 * Aggregate root representing a complete medical image analysis
 * Contains all business logic for medical image triage
 */
export class MedicalImageAnalysis {
  constructor(
    public readonly isAppropriate: boolean,
    public readonly findings: MedicalFinding[],
    public readonly medicalKeywords: string[],
    public readonly assessment: string,
    public readonly urgencyLevel: UrgencyLevel,
    public readonly textContent?: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (typeof this.isAppropriate !== 'boolean') {
      throw new Error('isAppropriate must be a boolean');
    }

    if (!Array.isArray(this.findings)) {
      throw new Error('findings must be an array');
    }

    if (!Array.isArray(this.medicalKeywords)) {
      throw new Error('medicalKeywords must be an array');
    }

    if (!this.assessment || this.assessment.trim() === '') {
      throw new Error('assessment cannot be empty');
    }

    if (!Object.values(UrgencyLevel).includes(this.urgencyLevel)) {
      throw new Error('Invalid urgency level');
    }
  }

  /**
   * Check if analysis indicates emergency situation
   */
  isEmergency(): boolean {
    return this.urgencyLevel === UrgencyLevel.CRITICAL;
  }

  /**
   * Check if immediate medical attention is needed
   */
  requiresImmediateAttention(): boolean {
    return this.urgencyLevel === UrgencyLevel.CRITICAL || 
           this.urgencyLevel === UrgencyLevel.HIGH;
  }

  /**
   * Get high-confidence findings only
   */
  getHighConfidenceFindings(threshold: number = 0.7): MedicalFinding[] {
    return this.findings.filter(finding => finding.isHighConfidence(threshold));
  }

  /**
   * Get medical disclaimer text
   */
  getDisclaimer(): string {
    return `
⚠️ IMPORTANTE - DISCLAIMER DE TRIAGEM:

• Esta é uma TRIAGEM PRELIMINAR baseada em IA, não um diagnóstico médico
• Serve apenas para orientar sobre a urgência do atendimento necessário
• NÃO substitui avaliação, consulta ou tratamento médico profissional
• A decisão final sobre atendimento deve sempre ser do paciente e profissional médico
• Em caso de dúvida ou piora dos sintomas, procure atendimento médico
• Para emergências reais, ligue 192 (SAMU) ou vá ao pronto-socorro
• A precisão varia conforme qualidade da imagem e condição apresentada

Esta ferramenta é apenas um APOIO INICIAL para orientação sobre tipo de atendimento médico.
    `.trim();
  }

  /**
   * Factory method to create from parsed API response
   */
  static fromApiResponse(response: {
    isAppropriate?: boolean;
    detectedFindings?: Array<{ name: string; confidence: number }>;
    medicalKeywords?: string[];
    assessment?: string;
    urgencyLevel?: string;
    textContent?: string;
  }): MedicalImageAnalysis {
    const findings = (response.detectedFindings || []).map(
      f => MedicalFinding.fromObject(f)
    );

    const urgencyLevel = Object.values(UrgencyLevel).includes(response.urgencyLevel as UrgencyLevel)
      ? (response.urgencyLevel as UrgencyLevel)
      : UrgencyLevel.LOW;

    return new MedicalImageAnalysis(
      response.isAppropriate ?? true,
      findings,
      response.medicalKeywords || [],
      response.assessment || 'Análise da imagem concluída.',
      urgencyLevel,
      response.textContent,
    );
  }

  /**
   * Convert to legacy format for backward compatibility
   */
  toLegacyFormat(): {
    isAppropriate: boolean;
    labels: Array<{ name: string; confidence: number }>;
    medicalKeywords: string[];
    textContent?: string;
    medicalAssessment: string;
    disclaimer: string;
    urgencyLevel: UrgencyLevel;
  } {
    return {
      isAppropriate: this.isAppropriate,
      labels: this.findings.map(f => f.toObject()),
      medicalKeywords: this.medicalKeywords,
      textContent: this.textContent,
      medicalAssessment: this.assessment,
      disclaimer: this.getDisclaimer(),
      urgencyLevel: this.urgencyLevel,
    };
  }
}
