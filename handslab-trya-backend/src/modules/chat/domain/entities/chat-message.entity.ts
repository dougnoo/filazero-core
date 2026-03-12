import { randomUUID } from 'crypto';
import { Attachment } from './attachment.entity';
import { AudioMessage } from '../value-objects/audio-message.value-object';
import { InvalidMessageError } from '../errors/invalid-message.error';

export class ChatMessage {
  private constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly tenantId: string,
    public readonly attachments: Attachment[],
    public readonly audioMessage?: AudioMessage,
    public readonly createdAt?: Date,
  ) {}

  static create(
    content: string,
    sessionId: string,
    userId: string,
    userName: string,
    tenantId: string,
    attachments: Attachment[] = [],
    audioMessage?: AudioMessage,
  ): ChatMessage {
    if (!content && !audioMessage && attachments.length === 0) {
      throw new InvalidMessageError(
        'Message must have content, audio, or attachments',
      );
    }

    if (!sessionId) {
      throw new InvalidMessageError('Session ID is required');
    }

    if (!userId) {
      throw new InvalidMessageError('User ID is required');
    }

    if (!tenantId) {
      throw new InvalidMessageError('Tenant ID is required');
    }

    return new ChatMessage(
      randomUUID(),
      content || '',
      sessionId,
      userId,
      userName,
      tenantId,
      attachments,
      audioMessage,
      new Date(),
    );
  }

  hasAttachments(): boolean {
    return this.attachments.length > 0;
  }

  hasAudio(): boolean {
    return !!this.audioMessage;
  }

  hasContent(): boolean {
    return !!this.content && this.content.trim().length > 0;
  }
}
