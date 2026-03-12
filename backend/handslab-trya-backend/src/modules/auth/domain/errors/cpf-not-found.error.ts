export class CpfNotFoundError extends Error {
  constructor(message: string = 'CPF não encontrado') {
    super(message);
    this.name = 'CpfNotFoundError';
  }
}
