import { ImagePayload } from '../entities/image-payload';
import { OnboardData } from '../value-objects/onboard-data.value-object';
import { ChatProviderResponse } from '../types/chat-provider-response.type';

export interface IChatProvider {
  sendMessage(
    message: string,
    sessionId: string,
    userId: string,
    name: string,
    tenantId: string,
    audio?: string,
    audioFormat?: string,
    images?: ImagePayload[],
    onboardData?: OnboardData,
    hasOnboarded?: boolean,
  ): Promise<ChatProviderResponse>;
}

export const CHAT_PROVIDER_TOKEN = 'CHAT_PROVIDER_TOKEN';
