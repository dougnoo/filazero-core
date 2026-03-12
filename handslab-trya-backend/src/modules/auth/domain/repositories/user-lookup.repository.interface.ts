export interface IUserLookupRepository {
  findIdByEmail(
    email: string,
  ): Promise<{ id: string; tenantId: string; role: string } | null>;
}

export const USER_LOOKUP_REPOSITORY_TOKEN = 'USER_LOOKUP_REPOSITORY_TOKEN';
