import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
  MediaEncoding as AWSMediaEncoding,
  LanguageCode as AWSStreamingLanguageCode,
} from '@aws-sdk/client-transcribe-streaming';
import {
  ITranscriptionStreamingClient,
  StreamingTranscriptionSession,
} from '../domain/interfaces/transcription-streaming-client.interface';
import {
  StreamingTranscriptionConfig,
  StreamingTranscriptionEvent,
  StreamingMediaEncoding,
  StreamingLanguageCode,
  StreamingEventType,
} from '../domain/streaming-transcription.entity';
import { TranscriptionParserAdapter } from './transcription-parser.adapter';

/**
 * Infrastructure Adapter - AWS Transcribe Streaming Client Implementation
 * Implements ITranscriptionStreamingClient interface using AWS SDK
 */
@Injectable()
export class TranscribeStreamingAdapter implements ITranscriptionStreamingClient {
  private readonly logger = new Logger(TranscribeStreamingAdapter.name);
  private readonly client: TranscribeStreamingClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly parser: TranscriptionParserAdapter,
  ) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const config = { region };
    this.client = new TranscribeStreamingClient(config);

    this.logger.log(`Transcribe Streaming Client initialized: region=${region}`);
  }

  async startStreamingTranscription(
    config: StreamingTranscriptionConfig,
  ): Promise<StreamingTranscriptionSession> {
    this.logger.log(`🎙️ Starting streaming transcription for session: ${config.sessionId}`);

    let isStreaming = true;
    const audioBuffer: Uint8Array[] = [];
    let bufferPromiseResolve: ((value: Uint8Array | null) => void) | null = null;

    // Create audio input stream
    const audioInputStream = new WritableStream<Uint8Array>({
      write(chunk: Uint8Array) {
        if (isStreaming) {
          audioBuffer.push(chunk);
          if (bufferPromiseResolve) {
            const resolve = bufferPromiseResolve;
            bufferPromiseResolve = null;
            resolve(audioBuffer.shift() || null);
          }
        }
        return Promise.resolve();
      },
      close() {
        isStreaming = false;
        if (bufferPromiseResolve) {
          bufferPromiseResolve(null);
        }
        this.logger.log('🔇 Audio stream closed');
      },
      abort(reason) {
        isStreaming = false;
        this.logger.warn('❌ Audio stream aborted:', reason);
      },
    });

    // Async generator for audio chunks
    const audioChunksGenerator = async function* () {
      while (isStreaming) {
        if (audioBuffer.length > 0) {
          yield { AudioEvent: { AudioChunk: audioBuffer.shift()! } };
        } else {
          const chunk = await new Promise<Uint8Array | null>((resolve) => {
            bufferPromiseResolve = resolve;
            setTimeout(() => {
              if (bufferPromiseResolve === resolve) {
                bufferPromiseResolve = null;
                resolve(null);
              }
            }, 100);
          });

          if (chunk) {
            yield { AudioEvent: { AudioChunk: chunk } };
          }
        }
      }
    };

    // Create transcription command
    const command = new StartStreamTranscriptionCommand({
      LanguageCode: this.mapLanguageCode(config.languageCode),
      MediaSampleRateHertz: config.sampleRate,
      MediaEncoding: this.mapMediaEncoding(config.mediaEncoding),
      AudioStream: audioChunksGenerator(),
      EnablePartialResultsStabilization: config.enablePartialResultsStabilization,
      PartialResultsStability: config.partialResultsStability,
    });

    // Create transcription output stream
    let transcriptionController: ReadableStreamDefaultController<StreamingTranscriptionEvent>;
    const transcriptionOutputStream = new ReadableStream<StreamingTranscriptionEvent>({
      start(controller) {
        transcriptionController = controller;
      },
    });

    // Process streaming in background
    this.processStreamingTranscription(command, transcriptionController!, config.sessionId);

    // Stop function
    const stop = () => {
      this.logger.log(`🛑 Stopping streaming transcription for session: ${config.sessionId}`);
      isStreaming = false;
      transcriptionController?.close();
    };

    return {
      audioStream: audioInputStream,
      transcriptionStream: transcriptionOutputStream,
      stop,
    };
  }

  private async processStreamingTranscription(
    command: StartStreamTranscriptionCommand,
    controller: ReadableStreamDefaultController<StreamingTranscriptionEvent>,
    sessionId: string,
  ): Promise<void> {
    try {
      this.logger.log(`🚀 Processing streaming transcription for session: ${sessionId}`);

      const response = await this.client.send(command);

      if (!response.TranscriptResultStream) {
        throw new Error('Transcript result stream not received');
      }

      for await (const event of response.TranscriptResultStream) {
        if (event.TranscriptEvent?.Transcript?.Results) {
          for (const result of event.TranscriptEvent.Transcript.Results) {
            if (result.Alternatives && result.Alternatives.length > 0) {
              const alternative = result.Alternatives[0];
              const text = alternative.Transcript || '';
              const confidence = this.parser.calculateResultConfidence(alternative.Items || []);

              const transcriptionEvent = result.IsPartial
                ? StreamingTranscriptionEvent.createPartial(text, confidence)
                : StreamingTranscriptionEvent.createFinal(text, confidence);

              this.logger.debug(
                `📝 ${result.IsPartial ? 'Partial' : 'Final'} transcription: "${text}" (${confidence.toFixed(2)})`,
              );
              controller.enqueue(transcriptionEvent);
            }
          }
        } else if (event.BadRequestException) {
          const errorEvent = StreamingTranscriptionEvent.createError(
            `Bad request: ${event.BadRequestException.Message}`,
          );
          controller.enqueue(errorEvent);
          this.logger.error('❌ BadRequestException:', event.BadRequestException.Message);
        } else if (event.LimitExceededException) {
          const errorEvent = StreamingTranscriptionEvent.createError(
            `Limit exceeded: ${event.LimitExceededException.Message}`,
          );
          controller.enqueue(errorEvent);
          this.logger.error('❌ LimitExceededException:', event.LimitExceededException.Message);
        } else if (event.InternalFailureException) {
          const errorEvent = StreamingTranscriptionEvent.createError(
            `Internal failure: ${event.InternalFailureException.Message}`,
          );
          controller.enqueue(errorEvent);
          this.logger.error('❌ InternalFailureException:', event.InternalFailureException.Message);
        }
      }

      controller.enqueue(StreamingTranscriptionEvent.createComplete());
      this.logger.log(`✅ Streaming transcription complete for session: ${sessionId}`);
    } catch (error) {
      this.logger.error('❌ Streaming transcription processing error:', error);
      const errorEvent = StreamingTranscriptionEvent.createError(error.message);
      controller.enqueue(errorEvent);
    } finally {
      controller.close();
    }
  }

  private mapMediaEncoding(encoding: StreamingMediaEncoding): AWSMediaEncoding {
    const mapping: Record<StreamingMediaEncoding, AWSMediaEncoding> = {
      [StreamingMediaEncoding.PCM]: AWSMediaEncoding.PCM,
      [StreamingMediaEncoding.OGG_OPUS]: AWSMediaEncoding.OGG_OPUS,
      [StreamingMediaEncoding.FLAC]: AWSMediaEncoding.FLAC,
    };
    return mapping[encoding] || AWSMediaEncoding.PCM;
  }

  private mapLanguageCode(code: StreamingLanguageCode): AWSStreamingLanguageCode {
    const mapping: Record<StreamingLanguageCode, AWSStreamingLanguageCode> = {
      [StreamingLanguageCode.PT_BR]: AWSStreamingLanguageCode.PT_BR,
      [StreamingLanguageCode.EN_US]: AWSStreamingLanguageCode.EN_US,
      [StreamingLanguageCode.ES_US]: AWSStreamingLanguageCode.ES_US,
    };
    return mapping[code] || AWSStreamingLanguageCode.PT_BR;
  }
}
