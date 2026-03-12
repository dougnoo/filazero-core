export class Provider {
  id?: string;
  locationHash: string;
  name: string;
  phone1AreaCode?: string;
  phone1?: string;
  phone2AreaCode?: string;
  phone2?: string;
  whatsappAreaCode?: string;
  whatsapp?: string;
  insuranceCompany: string;
  branchName: string;
  networkName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  private constructor(data: Partial<Provider>) {
    Object.assign(this, data);
  }

  static create(data: {
    locationHash: string;
    name: string;
    insuranceCompany: string;
    branchName: string;
    networkName: string;
    phone1AreaCode?: string;
    phone1?: string;
    phone2AreaCode?: string;
    phone2?: string;
    whatsappAreaCode?: string;
    whatsapp?: string;
  }): Provider {
    return new Provider({
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(data: Provider): Provider {
    return new Provider(data);
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }
}
