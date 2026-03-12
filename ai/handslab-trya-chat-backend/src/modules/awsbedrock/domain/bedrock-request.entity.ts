export class BedrockRequest {
  constructor(
    public readonly modelId: string,
    public readonly prompt: string,
    public readonly sessionId: string,
    public readonly audioBuffer?: Buffer,
    public readonly audioMimeType?: string,
  ) {}

  hasAudio(): boolean {
    return !!(this.audioBuffer && this.audioMimeType);
  }

  getProcessedPrompt(): string {
    return this.prompt.trim() || 'Olá';
  }
}