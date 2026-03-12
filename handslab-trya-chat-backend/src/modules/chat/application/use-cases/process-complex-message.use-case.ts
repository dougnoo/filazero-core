import { Injectable, Logger, Inject } from '@nestjs/common';
import { ChatMessage } from '../../domain/chat-message.entity';
import { ChatResponse } from '../../domain/chat-response.entity';
import { ProcessTextMessageUseCase } from './process-text-message.use-case';
import { ProcessAudioMessageUseCase } from './process-audio-message.use-case';
import { ProcessImageMessageUseCase } from './process-image-message.use-case';

@Injectable()
export class ProcessComplexMessageUseCase {
  private readonly logger = new Logger(ProcessComplexMessageUseCase.name);

  constructor(
    private readonly processTextMessageUseCase: ProcessTextMessageUseCase,
    private readonly processAudioMessageUseCase: ProcessAudioMessageUseCase,
    private readonly processImageMessageUseCase: ProcessImageMessageUseCase,
  ) {}

  async execute(
    message: ChatMessage,
    audioBuffer?: Buffer,
    imageBuffer?: Buffer,
  ): Promise<ChatResponse> {
    try {
      this.logger.debug(`Processing complex message for tenant ${message.tenantId}, session ${message.sessionId}`);
      this.logger.debug(`Has audio: ${message.hasAudio()}, Has image: ${message.hasImage()}, Has content: ${message.hasContent()}`);

      // Priority: Image > Audio > Text
      if (message.hasImage() && imageBuffer) {
        this.logger.debug('Processing as image message');
        return await this.processImageMessageUseCase.execute(message, imageBuffer);
      }

      if (message.hasAudio() && audioBuffer) {
        this.logger.debug('Processing as audio message');
        return await this.processAudioMessageUseCase.execute(message, audioBuffer);
      }

      if (message.hasContent()) {
        this.logger.debug('Processing as text message');
        return await this.processTextMessageUseCase.execute(message);
      }

      throw new Error('Message must contain at least one of: content, audio, or image data');
    } catch (error) {
      this.logger.error(`Failed to process complex message: ${error.message}`, error.stack);
      throw error;
    }
  }
}