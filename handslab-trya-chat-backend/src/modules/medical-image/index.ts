/**
 * Medical Image Module - Public API
 * 
 * Exports públicas do módulo de análise de imagens médicas.
 * Consumidores devem importar apenas deste arquivo.
 */

// Module
export { MedicalImageModule } from './medical-image.module';

// Service (Facade)
export { MedicalImageService, ImageAnalysisResult } from './medical-image.service';

// Domain Entities
export { MedicalImageAnalysis } from './domain/medical-image-analysis.entity';
export { ImageMetadata } from './domain/image-metadata.entity';
export { MedicalFinding } from './domain/medical-finding.entity';

// Domain Enums
export { UrgencyLevel } from './domain/urgency-level.enum';

// Domain Interfaces (para testes e extensões)
export { IMedicalImageAnalyzer } from './domain/interfaces/medical-image-analyzer.interface';
export { IRateLimiter } from './domain/interfaces/rate-limiter.interface';
export { IResponseParser } from './domain/interfaces/response-parser.interface';

// DI Tokens (para testes com mocks)
export {
  MEDICAL_IMAGE_ANALYZER_TOKEN,
  RATE_LIMITER_TOKEN,
  RESPONSE_PARSER_TOKEN,
} from './tokens';