import { Injectable } from '@nestjs/common';

/**
 * Use case for validating image format and size
 * Ensures images meet requirements before processing
 */
@Injectable()
export class ValidateImageFormatUseCase {
  private readonly supportedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
  private readonly minSizeBytes = 1024; // 1KB
  private readonly maxSizeBytes = 10485760; // 10MB

  execute(mimeType: string, buffer: Buffer): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate MIME type
    if (!this.isValidFormat(mimeType)) {
      errors.push(
        `Unsupported format: ${mimeType}. Supported: ${this.supportedFormats.join(', ')}`,
      );
    }

    // Validate size
    if (!this.isValidSize(buffer)) {
      const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
      errors.push(
        `Invalid size: ${sizeMB}MB. Must be between ${this.minSizeBytes / 1024}KB and ${this.maxSizeBytes / (1024 * 1024)}MB`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  isValidFormat(mimeType: string): boolean {
    return this.supportedFormats.includes(mimeType.toLowerCase());
  }

  isValidSize(buffer: Buffer): boolean {
    return buffer.length >= this.minSizeBytes && buffer.length <= this.maxSizeBytes;
  }

  getSupportedFormats(): string[] {
    return [...this.supportedFormats];
  }

  getSizeLimits(): { minBytes: number; maxBytes: number } {
    return {
      minBytes: this.minSizeBytes,
      maxBytes: this.maxSizeBytes,
    };
  }
}
