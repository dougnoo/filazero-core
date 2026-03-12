export class AmilNeighborhood {
  code: string;
  name: string;
  municipality: string;

  constructor(partial: Partial<AmilNeighborhood>) {
    Object.assign(this, partial);
  }

  validate(): void {
    if (!this.code) {
      throw new Error('Neighborhood code is required');
    }
    if (!this.name) {
      throw new Error('Neighborhood name is required');
    }
    if (!this.municipality) {
      throw new Error('Municipality is required');
    }
  }
}
