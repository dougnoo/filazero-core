export class OnboardData {
  private constructor(
    public readonly chronicConditions: string[],
    public readonly medications: Array<{ name: string; dosage?: string }>,
    public readonly allergies?: string,
  ) {}

  static create(
    chronicConditions: string[],
    medications: Array<{ name: string; dosage?: string }>,
    allergies?: string,
  ): OnboardData {
    return new OnboardData(chronicConditions, medications, allergies);
  }
}
