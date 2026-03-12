export class CannotDeactivateSelfError extends Error {
  constructor() {
    super('Você não pode desativar sua própria conta');
    this.name = 'CannotDeactivateSelfError';
  }
}
