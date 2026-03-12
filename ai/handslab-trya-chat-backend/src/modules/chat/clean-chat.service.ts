import { Injectable, Logger, Inject } from '@nestjs/common';
import { ChatApplicationService } from './application/services/chat-application.service';
import { ChatMessage } from './domain/chat-message.entity';
import { ChatResponse } from './domain/chat-response.entity';
import { NewMessageDto } from './dto/new-message.dto';
import { CHAT_SERVICE_TOKEN } from './tokens';
import { IChatService } from './domain/interfaces/chat-service.interface';

@Injectable()
export class CleanChatService {
  private readonly logger = new Logger(CleanChatService.name);

  constructor(
    @Inject(CHAT_SERVICE_TOKEN) private readonly chatService: IChatService,
  ) {}

  async chat(
    newMessageDto: NewMessageDto,
    audioBuffer?: Buffer,
    audioMimeType?: string,
    imageBuffer?: Buffer,
    imageMimeType?: string,
  ): Promise<any> {
    try {
      this.logger.debug(`Processing chat request for tenant ${newMessageDto.tenantId}`);

      // Convert DTO to domain entity
      const message = ChatMessage.fromDto(newMessageDto);

      // Process message based on content type
      let response: ChatResponse;

      if (message.hasImage() && imageBuffer) {
        response = await this.chatService.processMessageWithImage(message, imageBuffer);
      } else if (message.hasAudio() && audioBuffer) {
        response = await this.chatService.processMessageWithAudio(message, audioBuffer);
      } else {
        response = await this.chatService.processMessage(message);
      }

      // Return response in expected format
      return response.toApiResponse();
    } catch (error) {
      this.logger.error(`Failed to process chat request: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Alternative method that uses the ChatApplicationService directly
  async chatFromDto(newMessageDto: NewMessageDto): Promise<any> {
    try {
      this.logger.debug(`Processing chat DTO for tenant ${newMessageDto.tenantId}`);

      // Use ChatApplicationService's DTO processing method if available
      if (this.chatService instanceof ChatApplicationService) {
        const response = await this.chatService.processMessageFromDto(newMessageDto);
        return response.toApiResponse();
      }

      // Fallback to standard processing
      return this.chat(newMessageDto);
    } catch (error) {
      this.logger.error(`Failed to process chat DTO: ${error.message}`, error.stack);
      throw error;
    }
  }
}