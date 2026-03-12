export class AmilPlan {
  planCode: string;
  networkCode: string;
  name: string;
  cardName?: string;
  ansRegistration?: string;
  operatorName?: string;
  line?: string;

  constructor(partial: Partial<AmilPlan>) {
    Object.assign(this, partial);
  }

  validate(): void {
    if (!this.planCode) {
      throw new Error('Plan code is required');
    }
    if (!this.networkCode) {
      throw new Error('Network code is required');
    }
    if (!this.name) {
      throw new Error('Plan name is required');
    }
  }
}
