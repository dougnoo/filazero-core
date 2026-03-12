export interface UserDetailModel {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  tenantName?: string | null;
  cpf: string | null;
  phone?: string | null;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
  onboardedAt?: Date | null;
  medications: Array<{ id: string; name: string; dosage?: string | null }>;
  chronicConditions: Array<{ id: string; name: string }>;
  allergies: string;
  activePlan?: {
    planName: string;
    operatorName: string;
    activeUntil?: Date | null;
    cardNumber?: string;
  } | null;
}

export interface IUserDetailRepository {
  findUserDetailByEmail(email: string): Promise<UserDetailModel | null>;
  findUserDetailById(userId: string): Promise<UserDetailModel | null>;
  findUserById(
    userId: string,
  ): Promise<Pick<UserDetailModel, 'id' | 'cpf' | 'name' | 'email'> | null>;
}

export const USER_DETAIL_REPOSITORY_TOKEN = 'USER_DETAIL_REPOSITORY_TOKEN';
