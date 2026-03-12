export class AudioMessage {
  private constructor(
    public readonly data: string,
    public readonly format: string,
  ) {}

  static create(data: string, format?: string): AudioMessage {
    if (!data) {
      throw new Error('Audio data is required');
    }
    return new AudioMessage(data, format || 'webm');
  }
}
