/**
 * Mapeia a role retornada da API para a rota correspondente
 */
export type ApiRole = 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR' | 'HR' | 'ADMIN_RH' | 'BENEFICIARY';

export function getRouteByRole(role: string | undefined | null): string {
  if (!role) {
    return '/paciente'; // Default
  }

  const normalizedRole = role.toUpperCase().trim();

  switch (normalizedRole) {
    case 'SUPER_ADMIN':
      return '/super-admin';
    case 'ADMIN':
      return '/admin';
    case 'DOCTOR':
      return '/medico';
    case 'HR':
    case 'ADMIN_RH':
      return '/admin-rh';
    case 'BENEFICIARY':
      return '/paciente';
    default:
      // Fallback para paciente se a role não for reconhecida
      return '/paciente';
  }
}

