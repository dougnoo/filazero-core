export interface UpdateHrData {
  name?: string;
  cpf?: string;
  birthDate?: Date;
  email?: string;
  phone?: string;
}

export interface HrDetailModel {
  id: string;
  name: string;
  cpf: string | null;
  birthDate: Date;
  email: string | null;
  phone: string | null;
  tenantId: string | null;
  cognitoId: string | null;
  updatedAt: Date;
}

export abstract class IHrRepository {
  abstract findHrById(id: string): Promise<HrDetailModel | null>;
  abstract updateHr(id: string, data: UpdateHrData): Promise<HrDetailModel>;
}

export const HR_REPOSITORY_TOKEN = 'HR_REPOSITORY_TOKEN';
