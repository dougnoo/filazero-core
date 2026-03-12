import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TranscriptionService } from './transcription.service';

// Infrastructure Adapters
import { S3StorageAdapter } from './infrastructure/s3-storage.adapter';
import { TranscribeClientAdapter } from './infrastructure/transcribe-client.adapter';
import { TranscribeStreamingAdapter } from './infrastructure/transcribe-streaming.adapter';
import { TranscriptionParserAdapter } from './infrastructure/transcription-parser.adapter';

// Application Use Cases
import { TranscribeAudioUseCase } from './application/use-cases/transcribe-audio.use-case';
import { StartRealtimeTranscriptionUseCase } from './application/use-cases/start-realtime-transcription.use-case';

// Dependency Injection Tokens
import {
  STORAGE_CLIENT_TOKEN,
  TRANSCRIPTION_CLIENT_TOKEN,
  TRANSCRIPTION_STREAMING_CLIENT_TOKEN,
  TRANSCRIPTION_PARSER_TOKEN,
} from './tokens';

/**
 * Transcription Module following Clean Architecture
 * 
 * Dependencies flow:
 * TranscriptionService (Facade)
 *   → Use Cases (Application Layer)
 *     → Interfaces (Domain Layer)
 *       ← Adapters (Infrastructure Layer)
 * 
 * Following Dependency Inversion Principle:
 * - High-level modules depend on abstractions (interfaces)
 * - Low-level modules (adapters) implement those abstractions
 */
@Module({
  imports: [ConfigModule],
  providers: [
    // Application Service (Facade)
    TranscriptionService,

    // Application Use Cases
    TranscribeAudioUseCase,
    StartRealtimeTranscriptionUseCase,

    // Infrastructure Adapters with Dependency Injection
    {
      provide: STORAGE_CLIENT_TOKEN,
      useClass: S3StorageAdapter,
    },
    {
      provide: TRANSCRIPTION_CLIENT_TOKEN,
      useClass: TranscribeClientAdapter,
    },
    {
      provide: TRANSCRIPTION_STREAMING_CLIENT_TOKEN,
      useClass: TranscribeStreamingAdapter,
    },
    {
      provide: TRANSCRIPTION_PARSER_TOKEN,
      useClass: TranscriptionParserAdapter,
    },

    // Parser also needs to be available as concrete class for StreamingAdapter
    TranscriptionParserAdapter,
  ],
  exports: [TranscriptionService],
})
export class TranscriptionModule {}
