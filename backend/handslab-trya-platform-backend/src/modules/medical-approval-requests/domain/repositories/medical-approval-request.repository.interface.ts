import { MedicalApprovalRequest } from '../entities/medical-approval-request.entity';
import { ApprovalStatus } from '../enums/approval-status.enum';
import { OrderBy } from '../enums/order-by.enum';
import { OrderDirection } from '../enums/order-direction.enum';

export interface MedicalApprovalRequestFilters {
  status?: ApprovalStatus;
  urgencyLevel?: string;
  patientName?: string;
  date?: string;
  orderBy?: OrderBy;
  orderDirection?: OrderDirection;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IMedicalApprovalRequestRepository {
  findBySessionId(sessionId: string): Promise<MedicalApprovalRequest | null>;
  findById(id: string): Promise<MedicalApprovalRequest | null>;
  findByPatientId(patientId: string): Promise<MedicalApprovalRequest[]>;
  findAll(
    filters: MedicalApprovalRequestFilters,
    pagination: Pagination,
  ): Promise<PaginatedResult<MedicalApprovalRequest>>;
  create(request: MedicalApprovalRequest): Promise<MedicalApprovalRequest>;
  save(request: MedicalApprovalRequest): Promise<MedicalApprovalRequest>;
}
