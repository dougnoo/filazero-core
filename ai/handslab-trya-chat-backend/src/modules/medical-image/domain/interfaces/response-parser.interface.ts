import { MedicalImageAnalysis } from '../medical-image-analysis.entity';

/**
 * Port interface for parsing AI model responses
 * Extracts structured medical analysis from various response formats
 */
export interface IResponseParser {
  /**
   * Parse raw text response from AI model into structured analysis
   * @param responseText Raw response from model (may contain JSON or plain text)
   * @returns Structured medical image analysis
   */
  parse(responseText: string): MedicalImageAnalysis;

  /**
   * Validate if response text is parseable
   */
  canParse(responseText: string): boolean;
}
