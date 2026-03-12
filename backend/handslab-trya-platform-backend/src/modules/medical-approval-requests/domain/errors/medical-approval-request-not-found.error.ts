export class MedicalApprovalRequestNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Medical approval request '${identifier}' not found`);
    this.name = 'MedicalApprovalRequestNotFoundError';
  }
}
