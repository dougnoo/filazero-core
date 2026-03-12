import { Injectable, Logger } from '@nestjs/common';
import { TranscriptionResult, TranscriptionSegment } from '../domain/transcription-result.entity';
import { ITranscriptionParser } from '../domain/interfaces/transcription-parser.interface';

/**
 * Infrastructure Adapter - Parses AWS Transcribe results
 * Implements ITranscriptionParser interface
 */
@Injectable()
export class TranscriptionParserAdapter implements ITranscriptionParser {
  private readonly logger = new Logger(TranscriptionParserAdapter.name);

  parseTranscriptionResult(rawData: string): TranscriptionResult {
    try {
      const data = JSON.parse(rawData);
      const results = data.results;

      if (!results || !results.transcripts || results.transcripts.length === 0) {
        throw new Error('No transcripts found in result data');
      }

      const text = results.transcripts[0].transcript;
      const items = results.items || [];
      const confidence = this.calculateAverageConfidence(items);
      const segments = this.parseSegments(items);

      this.logger.log(`✅ Parsed transcription: "${text.substring(0, 50)}..." (confidence: ${confidence.toFixed(2)})`);

      return new TranscriptionResult(text.trim(), confidence, segments);
    } catch (error) {
      this.logger.error('❌ Failed to parse transcription result', error);
      throw new Error(`Failed to parse transcription: ${error.message}`);
    }
  }

  calculateAverageConfidence(items: any[]): number {
    if (!items || items.length === 0) return 0;

    const confidenceValues = items
      .filter(item => item.type === 'pronunciation' && item.alternatives)
      .map(item => parseFloat(item.alternatives[0].confidence))
      .filter(conf => !isNaN(conf));

    if (confidenceValues.length === 0) return 0;

    return confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length;
  }

  private parseSegments(items: any[]): TranscriptionSegment[] {
    if (!items || items.length === 0) return [];

    return items
      .filter(item => item.type === 'pronunciation')
      .map(item => {
        const start = parseFloat(item.start_time || 0);
        const end = parseFloat(item.end_time || 0);
        const text = item.alternatives[0].content;
        const confidence = parseFloat(item.alternatives[0].confidence || 0);

        return new TranscriptionSegment(start, end, text, confidence);
      });
  }

  /**
   * Calculate confidence from streaming result items
   */
  calculateResultConfidence(items: any[]): number {
    if (!items || items.length === 0) return 0;

    const confidenceValues = items
      .filter(item => item.Confidence !== undefined)
      .map(item => parseFloat(item.Confidence))
      .filter(conf => !isNaN(conf));

    if (confidenceValues.length === 0) return 0;

    return confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length;
  }
}
