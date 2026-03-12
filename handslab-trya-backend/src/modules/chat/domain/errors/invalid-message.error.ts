export class InvalidMessageError extends Error {
  constructor(message: string = 'Invalid message') {
    super(message);
    this.name = 'InvalidMessageError';
  }
}
