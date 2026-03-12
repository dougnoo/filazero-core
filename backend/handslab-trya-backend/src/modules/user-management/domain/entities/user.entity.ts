import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: UserRole,
    public readonly isEmailVerified: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly tenantId?: string,
    public readonly lastLogin?: Date,
  ) {}

  public static create(
    id: string,
    username: string,
    email: string,
    name: string,
    role: UserRole,
    isEmailVerified: boolean = false,
    tenantId?: string,
  ): User {
    const now = new Date();
    return new User(
      id,
      username,
      email,
      name,
      role,
      isEmailVerified,
      now,
      now,
      tenantId,
    );
  }

  public updateLastLogin(): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.name,
      this.role,
      this.isEmailVerified,
      this.createdAt,
      this.updatedAt,
      this.tenantId,
      new Date(),
    );
  }

  public verifyEmail(): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.name,
      this.role,
      true,
      this.createdAt,
      new Date(),
      this.tenantId,
      this.lastLogin,
    );
  }

  public updateRole(newRole: UserRole): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.name,
      newRole,
      this.isEmailVerified,
      this.createdAt,
      this.updatedAt,
      this.tenantId,
      this.lastLogin,
    );
  }

  public updateName(newName: string): User {
    return new User(
      this.id,
      this.username,
      this.email,
      newName,
      this.role,
      this.isEmailVerified,
      this.createdAt,
      this.updatedAt,
      this.tenantId,
      this.lastLogin,
    );
  }
}
