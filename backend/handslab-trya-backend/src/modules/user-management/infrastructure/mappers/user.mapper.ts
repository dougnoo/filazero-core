import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

export class UserMapper {
  static toDomain(cognitoUser: any): User {
    return new User(
      cognitoUser.id || cognitoUser.sub,
      cognitoUser.username,
      cognitoUser.email,
      cognitoUser.name,
      this.mapRoleFromCognitoGroups(cognitoUser.groups || []),
      cognitoUser.email_verified || false,
      cognitoUser.createdAt ? new Date(cognitoUser.createdAt) : new Date(),
      cognitoUser.updatedAt ? new Date(cognitoUser.updatedAt) : new Date(),
      cognitoUser.tenantId || cognitoUser['custom:tenant_id'],
      cognitoUser.lastLogin ? new Date(cognitoUser.lastLogin) : undefined,
    );
  }

  static toCognitoUser(user: User): any {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.tenantId,
      email_verified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
    };
  }

  private static mapRoleFromCognitoGroups(groups: string[]): UserRole {
    // Mapear grupos do Cognito para roles do sistema
    if (groups.includes('super-admin')) return UserRole.SUPER_ADMIN;
    if (groups.includes('admin')) return UserRole.ADMIN;
    if (groups.includes('doctor')) return UserRole.DOCTOR;
    if (groups.includes('hr')) return UserRole.HR;
    if (groups.includes('beneficiary')) return UserRole.BENEFICIARY;

    // Default para BENEFICIARY se não encontrar grupo
    return UserRole.BENEFICIARY;
  }

  static mapRoleToCognitoGroup(role: UserRole): string {
    // Mapear roles do sistema para grupos do Cognito
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'SUPER_ADMIN';
      case UserRole.ADMIN:
        return 'ADMIN';
      case UserRole.DOCTOR:
        return 'DOCTOR';
      case UserRole.HR:
        return 'HR';
      case UserRole.BENEFICIARY:
        return 'BENEFICIARY';
      default:
        return 'BENEFICIARY';
    }
  }
}
