export class AmilMunicipality {
  code: string;
  name: string;
  state: string;

  constructor(partial: Partial<AmilMunicipality>) {
    Object.assign(this, partial);
  }

  validate(): void {
    if (!this.code) {
      throw new Error('Municipality code is required');
    }
    if (!this.name) {
      throw new Error('Municipality name is required');
    }
    if (!this.state) {
      throw new Error('State is required');
    }
  }
}
