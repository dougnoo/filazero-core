export class NewPasswordRequiredError extends Error {
  constructor(
    public readonly session: string,
    public readonly email: string,
  ) {
    super('New password required');
    this.name = 'NewPasswordRequiredError';
  }
}
