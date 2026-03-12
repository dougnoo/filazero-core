import { MedicalDocument } from '../../../database/entities/medical-document.entity';
import { User } from '../../../database/entities/user.entity';

export interface TenantSummary {
  id: string;
}

export interface FindMemberDocumentsInput {
  tenantId: string;
  ownerUserId: string;
  memberUserId: string;
}

export interface FindFamilyDocumentsInput {
  tenantId: string;
  ownerUserId: string;
}

export interface HasRecentAlertInput {
  tenantId: string;
  memberUserId: string;
  alertType: string;
  entityId?: string;
  since: Date;
}

export interface IHealthAlertSourceRepository {
  findTenants(targetTenantId?: string): Promise<TenantSummary[]>;
  findPrimaryUsers(tenantId: string): Promise<User[]>;
  findFamilyDocuments(input: FindFamilyDocumentsInput): Promise<MedicalDocument[]>;
  hasRecentAlert(input: HasRecentAlertInput): Promise<boolean>;
}

export const HEALTH_ALERT_SOURCE_REPOSITORY_TOKEN = Symbol('IHealthAlertSourceRepository');
