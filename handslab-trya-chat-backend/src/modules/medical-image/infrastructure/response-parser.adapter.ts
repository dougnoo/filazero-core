import { Injectable } from '@nestjs/common';
import { IResponseParser } from '../domain/interfaces';
import { MedicalImageAnalysis } from '../domain/medical-image-analysis.entity';
import { MedicalFinding } from '../domain/medical-finding.entity';
import { UrgencyLevel, toUrgencyLevel } from '../domain/urgency-level.enum';

/**
 * Infrastructure adapter for parsing Claude/AI responses
 * Handles both JSON and fallback text parsing
 */
@Injectable()
export class ResponseParserAdapter implements IResponseParser {
  parse(responseText: string): MedicalImageAnalysis {
    // Try JSON parsing first
    const jsonResult = this.tryJsonParse(responseText);
    if (jsonResult) {
      return jsonResult;
    }

    // Fallback to text parsing
    return this.fallbackTextParse(responseText);
  }

  canParse(responseText: string): boolean {
    return !!responseText && responseText.trim().length > 0;
  }

  private tryJsonParse(responseText: string): MedicalImageAnalysis | null {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return MedicalImageAnalysis.fromApiResponse({
        isAppropriate: parsed.isAppropriate,
        detectedFindings: parsed.detectedFindings,
        medicalKeywords: parsed.medicalKeywords,
        textContent: parsed.textContent,
        urgencyLevel: parsed.urgencyLevel,
        assessment: parsed.assessment,
      });
    } catch (error) {
      console.warn('Failed to parse JSON from response:', error.message);
      return null;
    }
  }

  private fallbackTextParse(responseText: string): MedicalImageAnalysis {
    const urgencyLevel = this.extractUrgencyFromText(responseText);
    const keywords = this.extractKeywordsFromText(responseText);
    const findings = keywords.map(keyword => new MedicalFinding(keyword, 0.8));

    return new MedicalImageAnalysis(
      true,
      findings,
      keywords,
      responseText || 'Análise da imagem realizada. Consulte um médico para avaliação profissional.',
      urgencyLevel,
      undefined,
    );
  }

  private extractUrgencyFromText(text: string): UrgencyLevel {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('critical') || lowerText.includes('emergência') || lowerText.includes('urgente')) {
      return UrgencyLevel.CRITICAL;
    } else if (lowerText.includes('high') || lowerText.includes('grave') || lowerText.includes('sério')) {
      return UrgencyLevel.HIGH;
    } else if (lowerText.includes('medium') || lowerText.includes('moderado') || lowerText.includes('atenção')) {
      return UrgencyLevel.MEDIUM;
    }

    return UrgencyLevel.LOW;
  }

  private extractKeywordsFromText(text: string): string[] {
    const medicalTerms = [
      'ferida', 'wound', 'corte', 'cut', 'hematoma', 'bruise',
      'queimadura', 'burn', 'infecção', 'infection', 'inflamação', 'inflammation',
      'lesão', 'lesion', 'erupção', 'rash', 'inchaço', 'swelling',
    ];

    const lowerText = text.toLowerCase();
    return medicalTerms.filter(term => lowerText.includes(term));
  }
}
