import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IMedicalImageAnalyzer } from '../../domain/interfaces';
import { ImageMetadata } from '../../domain/image-metadata.entity';
import { MedicalImageAnalysis } from '../../domain/medical-image-analysis.entity';
import { MEDICAL_IMAGE_ANALYZER_TOKEN } from '../../tokens';

/**
 * Use case for analyzing medical images
 * Orchestrates image validation and analysis workflow
 */
@Injectable()
export class AnalyzeMedicalImageUseCase {
  constructor(
    @Inject(MEDICAL_IMAGE_ANALYZER_TOKEN)
    private readonly analyzer: IMedicalImageAnalyzer,
  ) {}

  async execute(
    imageBuffer: Buffer,
    mimeType: string,
    tenantId: string,
  ): Promise<MedicalImageAnalysis> {
    // Create and validate image metadata
    const imageMetadata = new ImageMetadata(
      imageBuffer,
      mimeType,
      imageBuffer.length,
    );

    // Validate image format
    if (!imageMetadata.isSupportedFormat()) {
      throw new BadRequestException(
        `Unsupported image format: ${mimeType}. Supported formats: image/jpeg, image/jpg, image/png`,
      );
    }

    // Validate image size
    if (!imageMetadata.isValidSize()) {
      throw new BadRequestException(
        `Invalid image size: ${imageMetadata.getReadableSize()}. Must be between 1KB and 10MB`,
      );
    }

    console.log(`✅ Image validated: ${imageMetadata.getReadableSize()}, ${mimeType}`);

    // Analyze image
    return await this.analyzer.analyzeImage(imageMetadata, tenantId);
  }
}
