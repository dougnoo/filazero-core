/**
 * Domain Entity - Represents an audio file with metadata
 */
export class AudioFile {
  constructor(
    public readonly buffer: Buffer,
    public readonly mimeType: string,
    public readonly sessionId: string,
    public readonly timestamp: Date = new Date(),
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.buffer || this.buffer.length === 0) {
      throw new Error('Audio buffer cannot be empty');
    }

    if (!this.mimeType) {
      throw new Error('MIME type is required');
    }

    if (!this.sessionId || this.sessionId.trim().length === 0) {
      throw new Error('Session ID is required');
    }

    if (!this.isValidMimeType()) {
      throw new Error(`Unsupported MIME type: ${this.mimeType}`);
    }
  }

  private isValidMimeType(): boolean {
    const validTypes = [
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/ogg',
      'audio/mp4',
      'audio/m4a',
    ];
    return validTypes.includes(this.mimeType);
  }

  /**
   * Get file extension based on MIME type
   */
  getFileExtension(): string {
    const extensions: Record<string, string> = {
      'audio/webm': 'webm',
      'audio/webm;codecs=opus': 'webm',
      'audio/mp3': 'mp3',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/wave': 'wav',
      'audio/x-wav': 'wav',
      'audio/ogg': 'ogg',
      'audio/mp4': 'm4a',
      'audio/m4a': 'm4a',
    };
    
    return extensions[this.mimeType] || 'webm';
  }

  /**
   * Get size in bytes
   */
  getSizeInBytes(): number {
    return this.buffer.length;
  }

  /**
   * Get size in KB
   */
  getSizeInKB(): number {
    return Math.round(this.buffer.length / 1024);
  }

  /**
   * Generate a unique key for storage
   */
  generateStorageKey(prefix: string = 'transcribe'): string {
    const timestamp = this.timestamp.getTime();
    const extension = this.getFileExtension();
    return `${prefix}/${this.sessionId}-${timestamp}.${extension}`;
  }

  /**
   * Check if file size exceeds maximum
   */
  exceedsMaxSize(maxSizeInMB: number = 10): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return this.buffer.length > maxSizeInBytes;
  }
}
