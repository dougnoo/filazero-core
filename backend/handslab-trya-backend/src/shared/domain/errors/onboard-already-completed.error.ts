export class OnboardAlreadyCompletedError extends Error {
  constructor(message: string = 'Onboard já foi completado anteriormente') {
    super(message);
    this.name = 'OnboardAlreadyCompletedError';
  }
}
