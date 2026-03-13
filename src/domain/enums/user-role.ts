export enum UserRole {
  CITIZEN = 'CITIZEN',
  PROFESSIONAL = 'PROFESSIONAL',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

export const userRoleConfig: Record<UserRole, { label: string; homePath: string }> = {
  [UserRole.CITIZEN]: { label: 'Cidadão', homePath: '/app' },
  [UserRole.PROFESSIONAL]: { label: 'Profissional de Saúde', homePath: '/profissional' },
  [UserRole.MANAGER]: { label: 'Gestor', homePath: '/gestor' },
  [UserRole.ADMIN]: { label: 'Administrador', homePath: '/admin' },
};
