export class Service {
  id?: string;
  providerId: string;
  category: string;
  specialty: string;
  createdAt: Date;

  private constructor(data: Partial<Service>) {
    Object.assign(this, data);
  }

  static create(data: {
    providerId: string;
    category: string;
    specialty: string;
  }): Service {
    return new Service({
      ...data,
      createdAt: new Date(),
    });
  }

  static reconstitute(data: Service): Service {
    return new Service(data);
  }
}
