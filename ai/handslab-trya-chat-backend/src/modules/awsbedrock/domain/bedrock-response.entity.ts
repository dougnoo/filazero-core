export class BedrockResponse {
  constructor(
    public readonly answer: string,
    public readonly model: string,
    public readonly processingTimeMs?: number,
    public readonly metadata?: Record<string, any>,
  ) {
    if (!answer || !model) {
      throw new Error('Answer and model are required');
    }
  }

  static create(answer: string, model: string, processingTimeMs?: number): BedrockResponse {
    return new BedrockResponse(answer, model, processingTimeMs);
  }

  withMetadata(metadata: Record<string, any>): BedrockResponse {
    return new BedrockResponse(this.answer, this.model, this.processingTimeMs, {
      ...this.metadata,
      ...metadata,
    });
  }
}