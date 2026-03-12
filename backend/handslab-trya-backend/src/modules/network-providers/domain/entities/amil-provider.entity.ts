export class AmilEstablishment {
  address: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  cellphone?: string;
  latitude?: string;
  longitude?: string;

  constructor(partial: Partial<AmilEstablishment>) {
    Object.assign(this, partial);
  }
}

export class AmilPlanDetails {
  code: string;
  name: string;

  constructor(partial: Partial<AmilPlanDetails>) {
    Object.assign(this, partial);
  }
}

export class AmilProvider {
  tradeName: string;
  cnpj?: string;
  qualifications?: string[];
  establishments: AmilEstablishment[];
  plans?: AmilPlanDetails[];

  constructor(partial: Partial<AmilProvider>) {
    Object.assign(this, partial);
    if (partial.establishments) {
      this.establishments = partial.establishments.map(
        (est) => new AmilEstablishment(est),
      );
    } else {
      this.establishments = [];
    }
    if (partial.plans) {
      this.plans = partial.plans.map((plano) => new AmilPlanDetails(plano));
    }
  }

  validate(): void {
    if (!this.tradeName) {
      throw new Error('Provider name is required');
    }
    if (!this.establishments || this.establishments.length === 0) {
      throw new Error('At least one establishment is required');
    }
  }
}

export class AmilResult {
  quantity: number;
  specialty: string;
  providers: AmilProvider[];
  plan?: AmilPlanDetails;

  constructor(partial: Partial<AmilResult>) {
    Object.assign(this, partial);
    if (partial.providers) {
      this.providers = partial.providers.map(
        (prest) => new AmilProvider(prest),
      );
    } else {
      this.providers = [];
    }
    if (partial.plan) {
      this.plan = new AmilPlanDetails(partial.plan);
    }
  }

  validate(): void {
    if (this.quantity === undefined || this.quantity === null) {
      throw new Error('Quantity is required');
    }
    if (!this.specialty) {
      throw new Error('Specialty is required');
    }
    if (!this.providers) {
      throw new Error('Providers list is required');
    }
  }
}
