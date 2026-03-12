import { UserRole } from '../../../../shared/domain/enums';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: UserRole,
    public readonly emailVerified: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly cognitoId?: string,
    public readonly name?: string,
    public readonly phone?: string,
  ) {}
}
