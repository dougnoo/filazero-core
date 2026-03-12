export class ChatProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatProcessingError';
  }
}
