import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IUserDbRepository,
  CreateUserDbDto,
  UpdateUserDto,
  UserFilters,
  Pagination,
  PaginatedResult,
} from '../../domain/repositories/user-db.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserEntity } from '../entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { DatabaseSaveFailedError } from '../../domain/errors/database-save-failed.error';

@Injectable()
export class TypeORMUserDbRepository implements IUserDbRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(data: CreateUserDbDto): Promise<User> {
    try {
      const userEntity = this.userRepository.create({
        cognitoId: data.cognitoId,
        email: data.email,
        name: data.name,
        role: data.role,
        phone: data.phone,
        gender: data.gender,
        active: true,
      });

      const savedEntity = await this.userRepository.save(userEntity);
      return UserMapper.toDomain(savedEntity);
    } catch (error) {
      throw new DatabaseSaveFailedError(
        `Failed to create user: ${error.message}`,
      );
    }
  }

  async findById(id: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
      relations: ['doctor'],
    });

    if (!userEntity) {
      return null;
    }

    return UserMapper.toDomain(userEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { email },
      relations: ['doctor'],
    });

    if (!userEntity) {
      return null;
    }

    return UserMapper.toDomain(userEntity);
  }

  async findByCognitoId(cognitoId: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { cognitoId },
      relations: ['doctor'],
    });

    if (!userEntity) {
      return null;
    }

    return UserMapper.toDomain(userEntity);
  }

  async findAll(
    filters: UserFilters,
    pagination: Pagination,
  ): Promise<PaginatedResult<User>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.doctor', 'doctor');

    // Apply role filter
    if (filters.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    // Apply active filter
    if (filters.active !== undefined) {
      queryBuilder.andWhere('user.active = :active', {
        active: filters.active,
      });
    }

    // Apply search filter (name or email)
    if (filters.search) {
      queryBuilder.andWhere(
        '(LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    // Apply doctor-specific filters
    if (filters.crm) {
      queryBuilder.andWhere('LOWER(doctor.crm) LIKE LOWER(:crm)', {
        crm: `%${filters.crm}%`,
      });
    }

    if (filters.specialty) {
      queryBuilder.andWhere('LOWER(doctor.specialty) LIKE LOWER(:specialty)', {
        specialty: `%${filters.specialty}%`,
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (pagination.page - 1) * pagination.limit;
    queryBuilder.skip(skip).take(pagination.limit);

    // Execute query
    const userEntities = await queryBuilder.getMany();

    // Map to domain
    const users = userEntities.map((entity) => UserMapper.toDomain(entity));

    return {
      data: users,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
    });

    if (!userEntity) {
      throw new UserNotFoundError(id);
    }

    try {
      // Update fields
      if (data.name !== undefined) {
        userEntity.name = data.name;
      }
      if (data.phone !== undefined) {
        userEntity.phone = data.phone;
      }
      if (data.profilePictureUrl !== undefined) {
        userEntity.profilePictureUrl = data.profilePictureUrl || undefined;
      }

      const updatedEntity = await this.userRepository.save(userEntity);

      // Reload with relations to get complete user object
      const reloadedEntity = await this.userRepository.findOne({
        where: { id: updatedEntity.id },
        relations: ['doctor'],
      });

      return UserMapper.toDomain(reloadedEntity!);
    } catch (error) {
      throw new DatabaseSaveFailedError(
        `Failed to update user: ${error.message}`,
      );
    }
  }

  async deactivate(id: string): Promise<void> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
    });

    if (!userEntity) {
      throw new UserNotFoundError(id);
    }

    try {
      userEntity.active = false;
      await this.userRepository.save(userEntity);
    } catch (error) {
      throw new DatabaseSaveFailedError(
        `Failed to deactivate user: ${error.message}`,
      );
    }
  }

  async reactivate(id: string): Promise<void> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
    });

    if (!userEntity) {
      throw new UserNotFoundError(id);
    }

    try {
      userEntity.active = true;
      await this.userRepository.save(userEntity);
    } catch (error) {
      throw new DatabaseSaveFailedError(
        `Failed to reactivate user: ${error.message}`,
      );
    }
  }
}
