export class DomainError extends Error {
  override readonly message: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
  }
}
