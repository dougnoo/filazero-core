/**
 * Value object representing image metadata
 * Pure domain entity with no external dependencies
 */
export class ImageMetadata {
  constructor(
    public readonly buffer: Buffer,
    public readonly mimeType: string,
    public readonly sizeBytes: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.buffer || this.buffer.length === 0) {
      throw new Error('Image buffer cannot be empty');
    }

    if (!this.mimeType || this.mimeType.trim() === '') {
      throw new Error('MIME type is required');
    }

    if (this.sizeBytes <= 0) {
      throw new Error('Image size must be greater than 0');
    }
  }

  /**
   * Check if image format is supported for medical analysis
   */
  isSupportedFormat(): boolean {
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    return supportedFormats.includes(this.mimeType.toLowerCase());
  }

  /**
   * Check if image size is within allowed limits
   */
  isValidSize(minBytes: number = 1024, maxBytes: number = 10485760): boolean {
    return this.sizeBytes >= minBytes && this.sizeBytes <= maxBytes;
  }

  /**
   * Get image as base64 string
   */
  toBase64(): string {
    return this.buffer.toString('base64');
  }

  /**
   * Get human-readable size
   */
  getReadableSize(): string {
    const kb = this.sizeBytes / 1024;
    const mb = kb / 1024;
    
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }
    return `${kb.toFixed(2)} KB`;
  }
}
