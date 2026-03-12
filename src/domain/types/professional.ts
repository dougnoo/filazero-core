export interface Professional {
  id: string;
  fullName: string;
  email: string;
  crm?: string;
  coren?: string;
  specialty?: string;
  unitId: string;
  role: 'DOCTOR' | 'NURSE' | 'COMMUNITY_AGENT' | 'TECHNICIAN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
