import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MedicalImageService } from './medical-image.service';
import { AnalyzeMedicalImageUseCase } from './application/use-cases/analyze-medical-image.use-case';
import { ValidateImageFormatUseCase } from './application/use-cases/validate-image-format.use-case';
import { ClaudeVisionAdapter } from './infrastructure/claude-vision.adapter';
import { RateLimiterAdapter } from './infrastructure/rate-limiter.adapter';
import { ResponseParserAdapter } from './infrastructure/response-parser.adapter';
import {
  MEDICAL_IMAGE_ANALYZER_TOKEN,
  RATE_LIMITER_TOKEN,
  RESPONSE_PARSER_TOKEN,
} from './tokens';

@Module({
  imports: [ConfigModule],
  providers: [
    // Facade Service
    MedicalImageService,

    // Use Cases
    AnalyzeMedicalImageUseCase,
    ValidateImageFormatUseCase,

    // Infrastructure Adapters (implementam interfaces do domain)
    {
      provide: MEDICAL_IMAGE_ANALYZER_TOKEN,
      useClass: ClaudeVisionAdapter,
    },
    {
      provide: RATE_LIMITER_TOKEN,
      useFactory: (configService: ConfigService) => {
        const maxRequestsPerMinute = configService.get<number>(
          'BEDROCK_REQUESTS_PER_MINUTE',
          4,
        );
        return new RateLimiterAdapter(maxRequestsPerMinute);
      },
      inject: [ConfigService],
    },
    {
      provide: RESPONSE_PARSER_TOKEN,
      useClass: ResponseParserAdapter,
    },
  ],
  exports: [MedicalImageService],
})
export class MedicalImageModule {}