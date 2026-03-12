import { Inject, Injectable } from '@nestjs/common';
import { CHAT_PROVIDER_TOKEN } from '../../domain/ports/chat-provider.interface';
import type { IChatProvider } from '../../domain/ports/chat-provider.interface';

@Injectable()
export class ChatService {
  constructor(
    @Inject(CHAT_PROVIDER_TOKEN) private readonly chatProvider: IChatProvider,
  ) {}

  async sendMessage(
    message: string,
    sessionId: string,
    userId: string,
    name: string,
    tenantId: string,
    audio?: string,
    audioFormat?: string,
    images?: any[],
  ): Promise<any> {
    return this.chatProvider.sendMessage(
      message,
      sessionId,
      userId,
      name,
      tenantId,
      audio,
      audioFormat,
      images,
    );
  }
}
