/**
 * Domain Entity - Pure business logic, no dependencies
 * Represents the result of a transcription operation
 */
export class TranscriptionResult {
  constructor(
    public readonly text: string,
    public readonly confidence: number,
    public readonly segments?: TranscriptionSegment[],
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.text || this.text.trim().length === 0) {
      throw new Error('Transcription text cannot be empty');
    }

    if (this.confidence < 0 || this.confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }
  }

  /**
   * Check if transcription meets minimum confidence threshold
   */
  hasMinimumConfidence(threshold: number = 0.7): boolean {
    return this.confidence >= threshold;
  }

  /**
   * Get formatted text with proper casing
   */
  getFormattedText(): string {
    if (!this.text) return '';
    
    const trimmed = this.text.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  /**
   * Get high confidence segments only
   */
  getHighConfidenceSegments(threshold: number = 0.8): TranscriptionSegment[] {
    if (!this.segments) return [];
    return this.segments.filter(segment => segment.confidence >= threshold);
  }
}

/**
 * Represents a segment (word/phrase) in a transcription
 */
export class TranscriptionSegment {
  constructor(
    public readonly start: number,
    public readonly end: number,
    public readonly text: string,
    public readonly confidence: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.start < 0) {
      throw new Error('Start time cannot be negative');
    }

    if (this.end < this.start) {
      throw new Error('End time must be greater than start time');
    }

    if (this.confidence < 0 || this.confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }
  }

  /**
   * Get duration of segment in seconds
   */
  getDuration(): number {
    return this.end - this.start;
  }

  /**
   * Check if this segment overlaps with another
   */
  overlaps(other: TranscriptionSegment): boolean {
    return this.start < other.end && this.end > other.start;
  }
}
