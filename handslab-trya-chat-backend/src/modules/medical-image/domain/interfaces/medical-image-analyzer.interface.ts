import { ImageMetadata } from '../image-metadata.entity';
import { MedicalImageAnalysis } from '../medical-image-analysis.entity';

/**
 * Port interface for medical image analysis
 * Defines contract for vision AI providers (Claude, GPT-4V, etc.)
 */
export interface IMedicalImageAnalyzer {
  /**
   * Analyze medical image and return triage assessment
   * @param imageMetadata Image data and metadata
   * @param tenantId Tenant identifier for tracking
   * @returns Medical analysis with urgency level
   */
  analyzeImage(
    imageMetadata: ImageMetadata,
    tenantId: string,
  ): Promise<MedicalImageAnalysis>;

  /**
   * Check if the analyzer is healthy and ready
   */
  isHealthy(): Promise<boolean>;
}
