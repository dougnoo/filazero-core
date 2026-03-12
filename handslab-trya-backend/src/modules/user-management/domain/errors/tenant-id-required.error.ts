export class TenantIdRequiredError extends Error {
  constructor(
    message: string = 'Tenant ID é obrigatório para SUPER_ADMIN e ADMIN',
  ) {
    super(message);
    this.name = 'TenantIdRequiredError';
  }
}
