export class Company {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  tenantId?: string;
  baseUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  private constructor(data: {
    id?: string;
    name: string;
    cnpj: string;
    email: string;
    tenantId?: string;
    baseUrl?: string;
    active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id || '';
    this.name = data.name;
    this.cnpj = data.cnpj;
    this.email = data.email;
    this.tenantId = data.tenantId;
    this.baseUrl = data.baseUrl;
    this.active = data.active ?? true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static create(data: {
    name: string;
    cnpj: string;
    email: string;
    tenantId?: string;
    baseUrl?: string;
  }): Company {
    return new Company({
      ...data,
      active: true,
    });
  }

  static reconstitute(data: {
    id: string;
    name: string;
    cnpj: string;
    email: string;
    tenantId?: string;
    baseUrl?: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Company {
    return new Company(data);
  }

  deactivate(): void {
    this.active = false;
    this.updatedAt = new Date();
  }

  reactivate(): void {
    this.active = true;
    this.updatedAt = new Date();
  }

  update(data: {
    name?: string;
    email?: string;
    tenantId?: string;
    baseUrl?: string;
  }): void {
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    if (data.tenantId !== undefined) this.tenantId = data.tenantId;
    if (data.baseUrl !== undefined) this.baseUrl = data.baseUrl;
    this.updatedAt = new Date();
  }
}
