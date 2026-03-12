import { Injectable, Inject } from '@nestjs/common';
import { CHAT_PROVIDER_TOKEN } from '../../domain/ports/chat-provider.interface';
import type { IChatProvider } from '../../domain/ports/chat-provider.interface';
import { FILE_PROCESSOR_TOKEN } from '../../domain/ports/file-processor.interface';
import type { IFileProcessor } from '../../domain/ports/file-processor.interface';
import { ChatMessage } from '../../domain/entities/chat-message.entity';
import { Attachment } from '../../domain/entities/attachment.entity';
import { AudioMessage } from '../../domain/value-objects/audio-message.value-object';
import { SendMessageDto } from '../dtos/send-message.dto';
import { ChatResponseDto } from '../dtos/chat-response.dto';
import { FileProcessingError } from '../../domain/errors/file-processing.error';
import { ChatProcessingError } from '../../domain/errors/chat-processing.error';

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(CHAT_PROVIDER_TOKEN)
    private readonly chatProvider: IChatProvider,
    @Inject(FILE_PROCESSOR_TOKEN)
    private readonly fileProcessor: IFileProcessor,
  ) {}

  async execute(dto: SendMessageDto): Promise<ChatResponseDto> {
    let attachments: Attachment[] = [];

    if (dto.files && dto.files.length > 0) {
      try {
        const images = await this.fileProcessor.processFiles(dto.files);
        attachments = images.map((img) => Attachment.fromImage(img));
      } catch (error) {
        throw new FileProcessingError(
          `Failed to process files: ${error.message}`,
        );
      }
    }

    const message = ChatMessage.create(
      dto.message,
      dto.sessionId,
      dto.userId,
      dto.userName,
      dto.tenantId,
      attachments,
      dto.audio ? AudioMessage.create(dto.audio, dto.audioFormat) : undefined,
    );

    try {
      const response = await this.chatProvider.sendMessage(
        message.content,
        message.sessionId,
        message.userId,
        message.userName,
        message.tenantId,
        message.audioMessage?.data,
        message.audioMessage?.format,
        attachments.map((a) => a.toImagePayload()),
        dto.onboardData,
        dto.hasOnboarded,
      );

      return ChatResponseDto.fromProviderResponse(response);
    } catch (error) {
      throw new ChatProcessingError(`Failed to send message: ${error.message}`);
    }
  }
}
