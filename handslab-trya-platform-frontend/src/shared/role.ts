// src/shared/theme/role-overrides.ts
import type { ClientTheme } from '@/shared/types/theme';
import type { DeepPartial } from '@/shared/types/deep-partial';

export enum RoleEnum {
  Paciente = 'paciente',
  Medico = 'medico',
  AdminRh = 'admin-rh',
  SuperAdmin = 'super-admin',
}

export type RoleSlug = RoleEnum;
export const ROLES: RoleSlug[] = Object.values(RoleEnum);
export const isRole = (v: string): v is RoleSlug => (Object.values(RoleEnum) as string[]).includes(v);

/**
 * ROLE_OVERRIDES: Ajustes específicos por role
 * 
 * IMPORTANTE: NÃO sobrescreve cores do tenant. Apenas ajusta configurações de layout.
 * As cores (primary, secondary, button.colors, etc) vêm do tema do tenant.
 */
export const ROLE_OVERRIDES: Record<RoleSlug, DeepPartial<ClientTheme>> = {
  [RoleEnum.Paciente]: {
    layout: { showPoweredBy: false },
  },
  
  [RoleEnum.Medico]: {
    layout: { showPoweredBy: false },
  },
  
  [RoleEnum.AdminRh]: {
    layout: { showPoweredBy: true },
  },
  
  [RoleEnum.SuperAdmin]: {
    layout: { showPoweredBy: false },
  },
} as const;
