import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: UserRole,
    public readonly tenantId: string,
    public readonly isEmailVerified: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lastLogin?: Date,
    public readonly dbId?: string, // ID do PostgreSQL (diferente do cognito_id)
  ) {}

  public static create(
    id: string,
    email: string,
    name: string,
    role: UserRole,
    tenantId: string,
    isEmailVerified: boolean = false,
  ): User {
    const now = new Date();
    return new User(id, email, name, role, tenantId, isEmailVerified, now, now);
  }

  public updateLastLogin(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.role,
      this.tenantId,
      this.isEmailVerified,
      this.createdAt,
      new Date(),
      new Date(),
    );
  }

  public verifyEmail(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.role,
      this.tenantId,
      true,
      this.createdAt,
      new Date(),
      this.lastLogin,
    );
  }
}
