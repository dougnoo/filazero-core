import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TranscriptionModule } from '../transcription/transcription.module';
import { TenantModule } from '../tenant/tenant.module';
import { LocationModule } from '../location/location.module';
import { HealthcareFacilitiesModule } from '../healthcare-facilities/healthcare-facilities.module';

// Clean Architecture imports
import { 
  BedrockClientAdapter, 
  RateLimitService, 
  TranscriptionServiceAdapter 
} from './infrastructure';
import { 
  BedrockService, 
  InvokeBedrockUseCase, 
  ProcessAudioWithTranscriptionUseCase,
  ProcessFunctionInvocationUseCase,
  ProcessLocationSearchUseCase,
  ProcessPatientTriageUseCase,
} from './application';

// Import tokens from separate file to avoid circular imports
import {
  BEDROCK_CLIENT_TOKEN,
  RATE_LIMIT_SERVICE_TOKEN,
  AUDIO_TRANSCRIPTION_SERVICE_TOKEN,
} from './tokens';

@Module({
  imports: [
    ConfigModule,
    TranscriptionModule,
    TenantModule,
    LocationModule,
    HealthcareFacilitiesModule,
  ],
  providers: [
    // Clean Architecture providers
    // Infrastructure layer - register both class and token
    BedrockClientAdapter,
    {
      provide: BEDROCK_CLIENT_TOKEN,
      useExisting: BedrockClientAdapter,
    },
    RateLimitService,
    {
      provide: RATE_LIMIT_SERVICE_TOKEN,
      useExisting: RateLimitService,
    },
    TranscriptionServiceAdapter,
    {
      provide: AUDIO_TRANSCRIPTION_SERVICE_TOKEN,
      useExisting: TranscriptionServiceAdapter,
    },
    
    // Application layer - Use Cases
    InvokeBedrockUseCase,
    ProcessAudioWithTranscriptionUseCase,
    ProcessFunctionInvocationUseCase,
    ProcessLocationSearchUseCase,
    ProcessPatientTriageUseCase,
    
    // Application layer - Services
    BedrockService,
  ],
  exports: [
    BedrockService,
    // Export Clean Architecture components for testing/advanced usage
    BedrockClientAdapter,
    RateLimitService,
    BEDROCK_CLIENT_TOKEN,
    RATE_LIMIT_SERVICE_TOKEN,
    
    // Export Use Cases
    InvokeBedrockUseCase,
    ProcessAudioWithTranscriptionUseCase,
    ProcessFunctionInvocationUseCase,
    ProcessLocationSearchUseCase,
    ProcessPatientTriageUseCase,
  ],
})
export class AwsbedrockModule {}
