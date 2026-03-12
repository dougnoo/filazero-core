export class InvalidPhoneFormatError extends Error {
  constructor(message: string = 'Formato de telefone inválido') {
    super(message);
    this.name = 'InvalidPhoneFormatError';
  }
}
