export class ChatMessage {
  constructor(
    public readonly content: string,
    public readonly model: string,
    public readonly sessionId: string,
    public readonly tenantId: string,
    public readonly audioData?: string,
    public readonly audioMimeType?: string,
    public readonly imageData?: string,
    public readonly imageMimeType?: string,
    public readonly medicalConsent?: boolean,
    public readonly timestamp?: Date,
  ) {
    if (!content && !audioData && !imageData) {
      throw new Error('Message must have either content, audio, or image data');
    }
    
    if (!sessionId || sessionId.length < 2) {
      throw new Error('Session ID is required and must be at least 2 characters');
    }
    
    if (!tenantId || tenantId.length < 1) {
      throw new Error('Tenant ID is required');
    }
    
    if (imageData && !medicalConsent) {
      throw new Error('Medical consent is required when sending images');
    }
  }

  hasAudio(): boolean {
    return !!(this.audioData && this.audioMimeType);
  }

  hasImage(): boolean {
    return !!(this.imageData && this.imageMimeType);
  }

  hasContent(): boolean {
    return !!this.content && this.content.length > 0;
  }

  isMedicalImage(): boolean {
    return this.hasImage() && this.medicalConsent === true;
  }

  getProcessedContent(): string {
    return this.content?.trim() || '';
  }

  static fromDto(dto: any): ChatMessage {
    return new ChatMessage(
      dto.message || '',
      dto.model,
      dto.sessionId,
      dto.tenantId,
      dto.audioData,
      dto.audioMimeType,
      dto.imageData,
      dto.imageMimeType,
      dto.medicalConsent,
      new Date(),
    );
  }
}