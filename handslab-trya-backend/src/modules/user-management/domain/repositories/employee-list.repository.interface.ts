import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

export interface EmployeeFilters {
  tenantId?: string;
  search?: string;
  active?: boolean;
  type?: UserRole;
  page?: number;
  limit?: number;
}

export interface PaginatedEmployees {
  data: EmployeeData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmployeeData {
  id: string;
  name: string;
  cpf: string | null;
  email: string;
  type: string;
  tenantName: string;
  active: boolean;
}

export interface IEmployeeListRepository {
  findEmployees(filters: EmployeeFilters): Promise<PaginatedEmployees>;
}

export const EMPLOYEE_LIST_REPOSITORY_TOKEN = 'EMPLOYEE_LIST_REPOSITORY_TOKEN';
