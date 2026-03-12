import { StreamingTranscriptionEvent, StreamingTranscriptionConfig } from '../streaming-transcription.entity';

/**
 * Port Interface - Defines contract for streaming transcription operations
 */
export interface ITranscriptionStreamingClient {
  /**
   * Start a real-time streaming transcription session
   * Returns streams for audio input and transcription output
   */
  startStreamingTranscription(
    config: StreamingTranscriptionConfig,
  ): Promise<StreamingTranscriptionSession>;
}

/**
 * Streaming transcription session
 */
export interface StreamingTranscriptionSession {
  /**
   * Stream to write audio chunks to
   */
  audioStream: WritableStream<Uint8Array>;

  /**
   * Stream to read transcription events from
   */
  transcriptionStream: ReadableStream<StreamingTranscriptionEvent>;

  /**
   * Function to stop the streaming session
   */
  stop: () => void;
}
