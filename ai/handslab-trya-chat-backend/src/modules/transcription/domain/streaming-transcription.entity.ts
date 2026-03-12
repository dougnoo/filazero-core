/**
 * Domain Entity - Represents streaming transcription configuration and events
 */

export enum StreamingEventType {
  PARTIAL = 'partial',
  FINAL = 'final',
  ERROR = 'error',
  COMPLETE = 'complete',
}

export enum StreamingMediaEncoding {
  PCM = 'pcm',
  OGG_OPUS = 'ogg-opus',
  FLAC = 'flac',
}

export enum StreamingLanguageCode {
  PT_BR = 'pt-BR',
  EN_US = 'en-US',
  ES_US = 'es-US',
}

export enum PartialStabilityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Configuration for streaming transcription
 */
export class StreamingTranscriptionConfig {
  constructor(
    public readonly sessionId: string,
    public readonly sampleRate: number = 16000,
    public readonly mediaEncoding: StreamingMediaEncoding = StreamingMediaEncoding.PCM,
    public readonly languageCode: StreamingLanguageCode = StreamingLanguageCode.PT_BR,
    public readonly enablePartialResultsStabilization: boolean = true,
    public readonly partialResultsStability: PartialStabilityLevel = PartialStabilityLevel.MEDIUM,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.sessionId || this.sessionId.trim().length === 0) {
      throw new Error('Session ID is required');
    }

    const validSampleRates = [8000, 16000, 32000, 44100, 48000];
    if (!validSampleRates.includes(this.sampleRate)) {
      throw new Error(`Invalid sample rate: ${this.sampleRate}. Must be one of: ${validSampleRates.join(', ')}`);
    }
  }

  /**
   * Check if configuration supports high quality audio
   */
  isHighQuality(): boolean {
    return this.sampleRate >= 44100;
  }
}

/**
 * Event emitted during streaming transcription
 */
export class StreamingTranscriptionEvent {
  constructor(
    public readonly type: StreamingEventType,
    public readonly text?: string,
    public readonly confidence?: number,
    public readonly isPartial?: boolean,
    public readonly error?: string,
    public readonly timestamp: Date = new Date(),
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.type === StreamingEventType.ERROR && !this.error) {
      throw new Error('Error message is required for error events');
    }

    if ((this.type === StreamingEventType.PARTIAL || this.type === StreamingEventType.FINAL) && !this.text) {
      throw new Error('Text is required for transcription events');
    }

    if (this.confidence !== undefined && (this.confidence < 0 || this.confidence > 1)) {
      throw new Error('Confidence must be between 0 and 1');
    }
  }

  /**
   * Check if this is a final transcription event
   */
  isFinal(): boolean {
    return this.type === StreamingEventType.FINAL;
  }

  /**
   * Check if this is an error event
   */
  isError(): boolean {
    return this.type === StreamingEventType.ERROR;
  }

  /**
   * Check if this event has high confidence
   */
  hasHighConfidence(threshold: number = 0.8): boolean {
    return this.confidence !== undefined && this.confidence >= threshold;
  }

  /**
   * Factory method for partial result
   */
  static createPartial(text: string, confidence: number): StreamingTranscriptionEvent {
    return new StreamingTranscriptionEvent(
      StreamingEventType.PARTIAL,
      text,
      confidence,
      true,
    );
  }

  /**
   * Factory method for final result
   */
  static createFinal(text: string, confidence: number): StreamingTranscriptionEvent {
    return new StreamingTranscriptionEvent(
      StreamingEventType.FINAL,
      text,
      confidence,
      false,
    );
  }

  /**
   * Factory method for error
   */
  static createError(error: string): StreamingTranscriptionEvent {
    return new StreamingTranscriptionEvent(
      StreamingEventType.ERROR,
      undefined,
      undefined,
      undefined,
      error,
    );
  }

  /**
   * Factory method for complete
   */
  static createComplete(): StreamingTranscriptionEvent {
    return new StreamingTranscriptionEvent(StreamingEventType.COMPLETE);
  }
}
