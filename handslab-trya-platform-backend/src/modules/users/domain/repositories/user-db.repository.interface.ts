import { User } from '../entities/user.entity';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { Gender } from '../../../../shared/domain/enums/gender.enum';

export interface CreateUserDbDto {
  cognitoId: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  gender: Gender;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  profilePictureUrl?: string | null;
}

export interface UpdateDoctorDto extends UpdateUserDto {
  crm?: string;
  specialty?: string;
}

export interface UserFilters {
  role?: UserRole;
  active?: boolean;
  search?: string;
  crm?: string;
  specialty?: string;
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

export interface IUserDbRepository {
  create(data: CreateUserDbDto): Promise<User>;

  /**
   * Finds a user by their ID
   * @param id - The user's unique identifier
   * @returns User entity with doctor relationship loaded (if exists), or null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Finds a user by their email address
   * @param email - The user's email address
   * @returns User entity with doctor relationship loaded (if exists), or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Finds a user by their Cognito ID
   * @param cognitoId - The user's Cognito sub identifier
   * @returns User entity with doctor relationship loaded (if exists), or null if not found
   */
  findByCognitoId(cognitoId: string): Promise<User | null>;

  findAll(
    filters: UserFilters,
    pagination: Pagination,
  ): Promise<PaginatedResult<User>>;

  /**
   * Updates basic user fields (name, phone)
   * @param id - The user's internal database identifier
   * @param data - The data to update (name, phone)
   * @returns Updated user entity
   */
  update(id: string, data: UpdateUserDto): Promise<User>;

  deactivate(id: string): Promise<void>;
  reactivate(id: string): Promise<void>;
}
