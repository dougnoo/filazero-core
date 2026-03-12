export class AmilSpecialty {
  code: string;
  name: string;
  serviceType?: string;

  constructor(partial: Partial<AmilSpecialty>) {
    Object.assign(this, partial);
  }

  validate(): void {
    if (!this.code) {
      throw new Error('Specialty code is required');
    }
    if (!this.name) {
      throw new Error('Specialty name is required');
    }
  }
}
