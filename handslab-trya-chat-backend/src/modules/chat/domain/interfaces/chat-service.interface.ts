import { ChatMessage } from '../chat-message.entity';
import { ChatResponse } from '../chat-response.entity';

export interface IChatService {
  processMessage(message: ChatMessage): Promise<ChatResponse>;
  processMessageWithAudio(message: ChatMessage, audioBuffer?: Buffer): Promise<ChatResponse>;
  processMessageWithImage(message: ChatMessage, imageBuffer?: Buffer): Promise<ChatResponse>;
  processComplexMessage(message: ChatMessage, audioBuffer?: Buffer, imageBuffer?: Buffer): Promise<ChatResponse>;
}