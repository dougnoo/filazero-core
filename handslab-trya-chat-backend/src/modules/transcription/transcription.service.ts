import { Injectable, Logger } from '@nestjs/common';
import { AudioFile } from './domain/audio-file.entity';
import { TranscriptionResult as DomainTranscriptionResult } from './domain/transcription-result.entity';
import {
  StreamingTranscriptionEvent as DomainStreamingEvent,
  StreamingMediaEncoding,
  StreamingLanguageCode,
  PartialStabilityLevel,
} from './domain/streaming-transcription.entity';
import { StreamingTranscriptionSession } from './domain/interfaces/transcription-streaming-client.interface';
import { TranscribeAudioUseCase } from './application/use-cases/transcribe-audio.use-case';
import { StartRealtimeTranscriptionUseCase } from './application/use-cases/start-realtime-transcription.use-case';

// Legacy interfaces for backward compatibility
export interface TranscriptionResult {
  text: string;
  confidence: number;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
    confidence: number;
  }>;
}

export interface StreamingTranscriptionEvent {
  type: 'partial' | 'final' | 'error' | 'complete';
  text?: string;
  confidence?: number;
  isPartial?: boolean;
  error?: string;
}

export interface StreamingTranscriptionOptions {
  sampleRate?: number;
  mediaEncoding?: string;
  languageCode?: string;
  enablePartialResultsStabilization?: boolean;
  partialResultsStability?: 'high' | 'medium' | 'low';
}

/**
 * Application Service (Facade Pattern)
 * Delegates to use cases following Clean Architecture
 * Maintains backward compatibility with existing code
 */
@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);

  constructor(
    private readonly transcribeAudioUseCase: TranscribeAudioUseCase,
    private readonly startRealtimeTranscriptionUseCase: StartRealtimeTranscriptionUseCase,
  ) {
    this.logger.log('TranscriptionService initialized (Clean Architecture)');
  }

  async transcribeAudio(
    audioBuffer: Buffer,
    audioMimeType: string,
    sessionId: string,
  ): Promise<TranscriptionResult> {
    try {
      this.logger.log(`Transcribing audio: ${audioBuffer.length} bytes`);
      const audioFile = new AudioFile(audioBuffer, audioMimeType, sessionId);
      const result = await this.transcribeAudioUseCase.execute(audioFile);
      
      return {
        text: result.text,
        confidence: result.confidence,
        segments: result.segments?.map(segment => ({
          start: segment.start,
          end: segment.end,
          text: segment.text,
          confidence: segment.confidence,
        })),
      };
    } catch (error) {
      this.logger.error('Transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  async startRealtimeTranscription(
    sessionId: string,
    options: StreamingTranscriptionOptions = {},
  ): Promise<{
    audioStream: WritableStream<Uint8Array>;
    transcriptionStream: ReadableStream<StreamingTranscriptionEvent>;
    stop: () => void;
  }> {
    try {
      this.logger.log(`Starting realtime transcription for session: ${sessionId}`);

      const mappedOptions = {
        sampleRate: options.sampleRate,
        mediaEncoding: this.mapMediaEncoding(options.mediaEncoding),
        languageCode: this.mapLanguageCode(options.languageCode),
        enablePartialResultsStabilization: options.enablePartialResultsStabilization,
        partialResultsStability: this.mapPartialStability(options.partialResultsStability),
      };

      const session = await this.startRealtimeTranscriptionUseCase.execute(sessionId, mappedOptions);
      const legacyStream = this.mapTranscriptionStream(session.transcriptionStream);

      return {
        audioStream: session.audioStream,
        transcriptionStream: legacyStream,
        stop: session.stop,
      };
    } catch (error) {
      this.logger.error('Failed to start realtime transcription:', error);
      throw new Error(`Failed to start realtime transcription: ${error.message}`);
    }
  }

  private mapTranscriptionStream(
    domainStream: ReadableStream<DomainStreamingEvent>,
  ): ReadableStream<StreamingTranscriptionEvent> {
    return new ReadableStream<StreamingTranscriptionEvent>({
      async start(controller) {
        const reader = domainStream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const legacyEvent: StreamingTranscriptionEvent = {
              type: value.type as any,
              text: value.text,
              confidence: value.confidence,
              isPartial: value.isPartial,
              error: value.error,
            };
            controller.enqueue(legacyEvent);
          }
        } finally {
          controller.close();
        }
      },
    });
  }

  private mapMediaEncoding(encoding?: string): StreamingMediaEncoding | undefined {
    if (!encoding) return undefined;
    const mapping: Record<string, StreamingMediaEncoding> = {
      'pcm': StreamingMediaEncoding.PCM,
      'ogg-opus': StreamingMediaEncoding.OGG_OPUS,
      'flac': StreamingMediaEncoding.FLAC,
    };
    return mapping[encoding.toLowerCase()];
  }

  private mapLanguageCode(code?: string): StreamingLanguageCode | undefined {
    if (!code) return undefined;
    const mapping: Record<string, StreamingLanguageCode> = {
      'pt-BR': StreamingLanguageCode.PT_BR,
      'en-US': StreamingLanguageCode.EN_US,
      'es-US': StreamingLanguageCode.ES_US,
    };
    return mapping[code];
  }

  private mapPartialStability(stability?: string): PartialStabilityLevel | undefined {
    if (!stability) return undefined;
    const mapping: Record<string, PartialStabilityLevel> = {
      'low': PartialStabilityLevel.LOW,
      'medium': PartialStabilityLevel.MEDIUM,
      'high': PartialStabilityLevel.HIGH,
    };
    return mapping[stability.toLowerCase()];
  }
}
