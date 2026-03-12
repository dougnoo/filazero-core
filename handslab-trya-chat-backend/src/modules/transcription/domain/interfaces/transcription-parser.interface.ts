import { TranscriptionResult } from '../transcription-result.entity';

/**
 * Port Interface - Defines contract for parsing transcription results
 */
export interface ITranscriptionParser {
  /**
   * Parse raw transcription data into domain entity
   */
  parseTranscriptionResult(rawData: string): TranscriptionResult;

  /**
   * Calculate average confidence from items
   */
  calculateAverageConfidence(items: any[]): number;
}
