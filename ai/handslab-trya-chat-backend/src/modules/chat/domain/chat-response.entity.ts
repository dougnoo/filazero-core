export class ChatResponse {
  constructor(
    public readonly answer: string,
    public readonly model: string,
    public readonly sessionId: string,
    public readonly tenantId: string,
    public readonly processingTimeMs?: number,
    public readonly imageAnalysis?: any,
    public readonly metadata?: Record<string, any>,
    public readonly timestamp?: Date,
  ) {}

  static create(
    answer: string,
    model: string,
    sessionId: string,
    tenantId: string,
    processingTimeMs?: number,
  ): ChatResponse {
    return new ChatResponse(
      answer,
      model,
      sessionId,
      tenantId,
      processingTimeMs,
      undefined,
      undefined,
      new Date(),
    );
  }

  withImageAnalysis(imageAnalysis: any): ChatResponse {
    return new ChatResponse(
      this.answer,
      this.model,
      this.sessionId,
      this.tenantId,
      this.processingTimeMs,
      imageAnalysis,
      this.metadata,
      this.timestamp,
    );
  }

  withMetadata(metadata: Record<string, any>): ChatResponse {
    return new ChatResponse(
      this.answer,
      this.model,
      this.sessionId,
      this.tenantId,
      this.processingTimeMs,
      this.imageAnalysis,
      {
        ...this.metadata,
        ...metadata,
      },
      this.timestamp,
    );
  }

  toApiResponse(): any {
    return {
      answer: this.answer,
      model: this.model,
      ...(this.imageAnalysis && { imageAnalysis: this.imageAnalysis }),
      ...(this.metadata && { metadata: this.metadata }),
      ...(this.processingTimeMs && { processingTimeMs: this.processingTimeMs }),
    };
  }
}