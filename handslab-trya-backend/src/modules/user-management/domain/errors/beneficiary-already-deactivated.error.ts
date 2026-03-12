export class BeneficiaryAlreadyDeactivatedError extends Error {
  constructor(message: string = 'Beneficiário já está desativado') {
    super(message);
    this.name = 'BeneficiaryAlreadyDeactivatedError';
  }
}
