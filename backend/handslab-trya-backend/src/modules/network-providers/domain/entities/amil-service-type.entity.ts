export class AmilServiceType {
  code: string;
  name: string;
  specialtiesUrl?: string;

  constructor(partial: Partial<AmilServiceType>) {
    Object.assign(this, partial);
  }

  validate(): void {
    if (!this.code) {
      throw new Error('Service type code is required');
    }
    if (!this.name) {
      throw new Error('Service type name is required');
    }
  }
}
