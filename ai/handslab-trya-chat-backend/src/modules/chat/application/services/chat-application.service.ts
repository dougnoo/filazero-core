import { Injectable, Logger } from '@nestjs/common';
import { ChatMessage } from '../../domain/chat-message.entity';
import { ChatResponse } from '../../domain/chat-response.entity';
import { IChatService } from '../../domain/interfaces/chat-service.interface';
import { ProcessComplexMessageUseCase } from '../use-cases/process-complex-message.use-case';
import { ProcessTextMessageUseCase } from '../use-cases/process-text-message.use-case';
import { ProcessAudioMessageUseCase } from '../use-cases/process-audio-message.use-case';
import { ProcessImageMessageUseCase } from '../use-cases/process-image-message.use-case';

@Injectable()
export class ChatApplicationService implements IChatService {
  private readonly logger = new Logger(ChatApplicationService.name);

  constructor(
    private readonly processComplexMessageUseCase: ProcessComplexMessageUseCase,
    private readonly processTextMessageUseCase: ProcessTextMessageUseCase,
    private readonly processAudioMessageUseCase: ProcessAudioMessageUseCase,
    private readonly processImageMessageUseCase: ProcessImageMessageUseCase,
  ) {}

  async processMessage(message: ChatMessage): Promise<ChatResponse> {
    this.logger.debug(`Processing message for tenant ${message.tenantId}`);
    return this.processTextMessageUseCase.execute(message);
  }

  async processMessageWithAudio(message: ChatMessage, audioBuffer?: Buffer): Promise<ChatResponse> {
    if (!audioBuffer) {
      throw new Error('Audio buffer is required for audio message processing');
    }
    return this.processAudioMessageUseCase.execute(message, audioBuffer);
  }

  async processMessageWithImage(message: ChatMessage, imageBuffer?: Buffer): Promise<ChatResponse> {
    if (!imageBuffer) {
      throw new Error('Image buffer is required for image message processing');
    }
    return this.processImageMessageUseCase.execute(message, imageBuffer);
  }

  async processComplexMessage(
    message: ChatMessage,
    audioBuffer?: Buffer,
    imageBuffer?: Buffer,
  ): Promise<ChatResponse> {
    return this.processComplexMessageUseCase.execute(message, audioBuffer, imageBuffer);
  }

  // Helper method to convert base64 data to buffer
  static decodeBase64ToBuffer(base64Data: string): Buffer {
    return Buffer.from(base64Data, 'base64');
  }

  // Main method that handles the full DTO processing
  async processMessageFromDto(
    dto: any,
    audioBuffer?: Buffer,
    imageBuffer?: Buffer,
  ): Promise<ChatResponse> {
    const message = ChatMessage.fromDto(dto);
    
    // Convert base64 data to buffers if needed
    const processedAudioBuffer = audioBuffer || (dto.audioData ? 
      ChatApplicationService.decodeBase64ToBuffer(dto.audioData) : undefined);
    
    const processedImageBuffer = imageBuffer || (dto.imageData ? 
      ChatApplicationService.decodeBase64ToBuffer(dto.imageData) : undefined);

    return this.processComplexMessage(message, processedAudioBuffer, processedImageBuffer);
  }
}