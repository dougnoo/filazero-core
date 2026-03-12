export class InsufficientPermissionsError extends Error {
  constructor(
    message: string = 'Usuário não tem permissão para executar esta ação',
  ) {
    super(message);
    this.name = 'InsufficientPermissionsError';
  }
}
