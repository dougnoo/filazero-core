import { Doctor } from '../entities/doctor.entity';
import { BoardCode } from '../../../../shared/domain/enums/board-code.enum';

export interface CreateDoctorDbDto {
  userId: string;
  specialty: string;
  boardCode: BoardCode;
  boardNumber: string;
  boardState: string;
}

export interface UpdateDoctorDto {
  boardCode?: BoardCode;
  boardNumber?: string;
  boardState?: string;
  specialty?: string;
}

export interface DoctorFilters {
  specialty?: string;
  active?: boolean;
  search?: string;
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

export interface IDoctorRepository {
  create(data: CreateDoctorDbDto): Promise<Doctor>;
  findById(id: string): Promise<Doctor | null>;
  findByUserId(userId: string): Promise<Doctor | null>;
  findAll(
    filters: DoctorFilters,
    pagination: Pagination,
  ): Promise<PaginatedResult<Doctor>>;
  update(id: string, data: UpdateDoctorDto): Promise<Doctor>;
}
