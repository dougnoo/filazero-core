export class CompanyNotFoundError extends Error {
  constructor(tenantId: string) {
    super(
      `Company with tenant_id '${tenantId}' not found or base URL not configured`,
    );
    this.name = 'CompanyNotFoundError';
  }
}
