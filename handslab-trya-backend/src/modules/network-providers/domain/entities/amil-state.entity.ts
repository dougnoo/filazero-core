export class AmilState {
  abbreviation: string;
  name: string;

  constructor(partial: Partial<AmilState>) {
    Object.assign(this, partial);
  }

  validate(): void {
    if (!this.abbreviation) {
      throw new Error('State abbreviation is required');
    }
    if (!this.name) {
      throw new Error('State name is required');
    }
  }
}
