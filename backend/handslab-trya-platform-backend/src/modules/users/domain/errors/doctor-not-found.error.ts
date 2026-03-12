export class DoctorNotFoundError extends Error {
  constructor(identifier?: string) {
    super(
      identifier
        ? `Doctor with id ${identifier} not found`
        : 'Doctor not found',
    );
    this.name = 'DoctorNotFoundError';
  }
}
