import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  StreamingTranscriptionConfig,
  StreamingMediaEncoding,
  StreamingLanguageCode,
  PartialStabilityLevel,
} from '../../domain/streaming-transcription.entity';
import {
  ITranscriptionStreamingClient,
  StreamingTranscriptionSession,
} from '../../domain/interfaces/transcription-streaming-client.interface';
import { TRANSCRIPTION_STREAMING_CLIENT_TOKEN } from '@modules/transcription/tokens';


/**
 * Application Use Case - Start Realtime Streaming Transcription
 * Orchestrates streaming transcription setup
 * Implements Single Responsibility Principle
 */
@Injectable()
export class StartRealtimeTranscriptionUseCase {
  private readonly logger = new Logger(StartRealtimeTranscriptionUseCase.name);

  constructor(
    @Inject(TRANSCRIPTION_STREAMING_CLIENT_TOKEN)
    private readonly streamingClient: ITranscriptionStreamingClient,
  ) {}

  async execute(
    sessionId: string,
    options?: Partial<{
      sampleRate: number;
      mediaEncoding: StreamingMediaEncoding;
      languageCode: StreamingLanguageCode;
      enablePartialResultsStabilization: boolean;
      partialResultsStability: PartialStabilityLevel;
    }>,
  ): Promise<StreamingTranscriptionSession> {
    this.logger.log(`🎙️ Starting realtime transcription for session: ${sessionId}`);

    try {
      // Validate session ID
      if (!sessionId || sessionId.trim().length === 0) {
        throw new Error('Session ID is required');
      }

      // Create configuration with defaults
      const config = new StreamingTranscriptionConfig(
        sessionId,
        options?.sampleRate || 16000,
        options?.mediaEncoding || StreamingMediaEncoding.PCM,
        options?.languageCode || StreamingLanguageCode.PT_BR,
        options?.enablePartialResultsStabilization ?? true,
        options?.partialResultsStability || PartialStabilityLevel.MEDIUM,
      );

      this.logger.debug(
        `Streaming config: sampleRate=${config.sampleRate}, encoding=${config.mediaEncoding}, lang=${config.languageCode}`,
      );

      // Start streaming session
      const session = await this.streamingClient.startStreamingTranscription(config);

      this.logger.log(`✅ Realtime transcription started for session: ${sessionId}`);

      return session;
    } catch (error) {
      this.logger.error('❌ Failed to start realtime transcription:', error);
      throw new Error(`Failed to start realtime transcription: ${error.message}`);
    }
  }
}
