import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../domain/enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator para definir quais roles podem acessar uma rota
 *
 * Uso: @Roles(UserRole.ADMIN, UserRole.DOCTOR)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
