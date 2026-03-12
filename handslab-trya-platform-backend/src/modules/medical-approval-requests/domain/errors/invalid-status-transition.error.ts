export class InvalidStatusTransitionError extends Error {
  constructor(currentStatus: string, attemptedStatus: string) {
    super(
      `Cannot transition from ${currentStatus} to ${attemptedStatus}. Invalid status transition.`,
    );
    this.name = 'InvalidStatusTransitionError';
  }
}
