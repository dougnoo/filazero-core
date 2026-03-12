import { RoleEnum } from '@/shared/role';

export interface User {
  id: string;
  email: string;
  name: string;
  role: RoleEnum | 'admin';
  tenant?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  theme: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;
}

export interface UserProfile extends User {
  permissions: string[];
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
  };
}
