/**
 * Public API of Transcription Module
 * Exports only what external modules need to consume
 * 
 * Following Interface Segregation Principle:
 * - Clients should not be forced to depend on interfaces they don't use
 */

// Module
export * from './transcription.module';

// Service (Facade)
export * from './transcription.service';

// Domain Entities (for type safety in external modules)
export { AudioFile } from './domain/audio-file.entity';
export { TranscriptionResult as TranscriptionResultEntity } from './domain/transcription-result.entity';
export { TranscriptionSegment } from './domain/transcription-result.entity';
export { TranscriptionJob, TranscriptionJobStatus } from './domain/transcription-job.entity';
export {
  StreamingTranscriptionConfig,
  StreamingTranscriptionEvent as StreamingTranscriptionEventEntity,
  StreamingEventType,
  StreamingMediaEncoding,
  StreamingLanguageCode,
  PartialStabilityLevel,
} from './domain/streaming-transcription.entity';

// Domain Interfaces (for testing and mocking)
export type { IStorageClient } from './domain/interfaces/storage-client.interface';
export type { ITranscriptionClient } from './domain/interfaces/transcription-client.interface';
export type { ITranscriptionStreamingClient, StreamingTranscriptionSession } from './domain/interfaces/transcription-streaming-client.interface';
export type { ITranscriptionParser } from './domain/interfaces/transcription-parser.interface';

// Dependency Injection Tokens (for testing)
export {
  STORAGE_CLIENT_TOKEN,
  TRANSCRIPTION_CLIENT_TOKEN,
  TRANSCRIPTION_STREAMING_CLIENT_TOKEN,
  TRANSCRIPTION_PARSER_TOKEN,
} from './tokens';
