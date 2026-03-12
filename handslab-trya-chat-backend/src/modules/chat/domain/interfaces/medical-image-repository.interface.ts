import { ChatMessage } from '../chat-message.entity';

export interface IMedicalImageRepository {
  analyzeImage(
    imageBuffer: Buffer,
    imageMimeType: string,
    tenantConfig: any,
  ): Promise<any>;
  
  isValidMedicalImageFormat(mimeType: string): boolean;
  isValidImageSize(imageBuffer: Buffer): boolean;
  getRateLimitStatus(): any;
}