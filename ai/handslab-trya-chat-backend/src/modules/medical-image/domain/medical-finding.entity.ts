/**
 * Value object representing a medical finding detected in an image
 * Pure domain entity with no external dependencies
 */
export class MedicalFinding {
  constructor(
    public readonly name: string,
    public readonly confidence: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim() === '') {
      throw new Error('Finding name cannot be empty');
    }

    if (this.confidence < 0 || this.confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }
  }

  /**
   * Check if confidence is high enough for reporting
   */
  isHighConfidence(threshold: number = 0.7): boolean {
    return this.confidence >= threshold;
  }

  /**
   * Get confidence as percentage
   */
  getConfidencePercentage(): number {
    return Math.round(this.confidence * 100);
  }

  /**
   * Factory method to create from plain object
   */
  static fromObject(obj: { name: string; confidence: number }): MedicalFinding {
    return new MedicalFinding(obj.name, obj.confidence);
  }

  /**
   * Convert to plain object
   */
  toObject(): { name: string; confidence: number } {
    return {
      name: this.name,
      confidence: this.confidence,
    };
  }
}
