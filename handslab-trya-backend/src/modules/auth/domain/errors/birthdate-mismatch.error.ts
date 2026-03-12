export class BirthdateMismatchError extends Error {
  constructor(message: string = 'Data de nascimento não confere') {
    super(message);
    this.name = 'BirthdateMismatchError';
  }
}
