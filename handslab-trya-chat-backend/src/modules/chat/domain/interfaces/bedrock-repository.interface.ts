import { ChatMessage } from '../chat-message.entity';

export interface IBedrockRepository {
  invokeForTenant(
    tenantId: string,
    agentId: string,
    agentAliasId: string,
    modelId: string,
    prompt: string,
    sessionId: string,
    audioBuffer?: Buffer,
    audioMimeType?: string,
  ): Promise<any>;
}