import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IDoctorRepository,
  CreateDoctorDbDto,
  UpdateDoctorDto,
  DoctorFilters,
  Pagination,
  PaginatedResult,
} from '../../domain/repositories/doctor.repository.interface';
import { Doctor } from '../../domain/entities/doctor.entity';
import { DoctorEntity } from '../entities/doctor.entity';
import { DoctorMapper } from '../mappers/doctor.mapper';
import { DoctorNotFoundError } from '../../domain/errors/doctor-not-found.error';
import { DatabaseSaveFailedError } from '../../domain/errors/database-save-failed.error';

@Injectable()
export class TypeORMDoctorRepository implements IDoctorRepository {
  constructor(
    @InjectRepository(DoctorEntity)
    private readonly doctorRepository: Repository<DoctorEntity>,
  ) {}

  async create(data: CreateDoctorDbDto): Promise<Doctor> {
    try {
      const doctorEntity = this.doctorRepository.create({
        userId: data.userId,
        boardCode: data.boardCode,
        boardNumber: data.boardNumber,
        boardState: data.boardState,
        specialty: data.specialty,
      });

      const savedEntity = await this.doctorRepository.save(doctorEntity);

      // Load the user relation
      const doctorWithUser = await this.doctorRepository.findOne({
        where: { id: savedEntity.id },
        relations: ['user'],
      });

      return DoctorMapper.toDomain(doctorWithUser!);
    } catch (error) {
      throw new DatabaseSaveFailedError(
        `Failed to create doctor: ${error.message}`,
      );
    }
  }

  async findById(id: string): Promise<Doctor | null> {
    const doctorEntity = await this.doctorRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!doctorEntity) {
      return null;
    }

    return DoctorMapper.toDomain(doctorEntity);
  }

  async findByUserId(userId: string): Promise<Doctor | null> {
    const doctorEntity = await this.doctorRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!doctorEntity) {
      return null;
    }

    return DoctorMapper.toDomain(doctorEntity);
  }

  async findAll(
    filters: DoctorFilters,
    pagination: Pagination,
  ): Promise<PaginatedResult<Doctor>> {
    const queryBuilder = this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.user', 'user');

    // Apply specialty filter
    if (filters.specialty) {
      queryBuilder.andWhere('doctor.specialty = :specialty', {
        specialty: filters.specialty,
      });
    }

    // Apply active filter (from user)
    if (filters.active !== undefined) {
      queryBuilder.andWhere('user.active = :active', {
        active: filters.active,
      });
    }

    // Apply search filter (name, email, or board number)
    if (filters.search) {
      queryBuilder.andWhere(
        '(LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search) OR LOWER(doctor.boardNumber) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (pagination.page - 1) * pagination.limit;
    queryBuilder.skip(skip).take(pagination.limit);

    // Execute query
    const doctorEntities = await queryBuilder.getMany();

    // Map to domain
    const doctors = doctorEntities.map((entity) =>
      DoctorMapper.toDomain(entity),
    );

    return {
      data: doctors,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async update(id: string, data: UpdateDoctorDto): Promise<Doctor> {
    const doctorEntity = await this.doctorRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!doctorEntity) {
      throw new DoctorNotFoundError(id);
    }

    try {
      // Update fields
      if (data.boardCode !== undefined) {
        doctorEntity.boardCode = data.boardCode;
      }
      if (data.boardNumber !== undefined) {
        doctorEntity.boardNumber = data.boardNumber;
      }
      if (data.boardState !== undefined) {
        doctorEntity.boardState = data.boardState;
      }
      if (data.specialty !== undefined) {
        doctorEntity.specialty = data.specialty;
      }

      const updatedEntity = await this.doctorRepository.save(doctorEntity);

      // Reload with user relation
      const doctorWithUser = await this.doctorRepository.findOne({
        where: { id: updatedEntity.id },
        relations: ['user'],
      });

      return DoctorMapper.toDomain(doctorWithUser!);
    } catch (error) {
      throw new DatabaseSaveFailedError(
        `Failed to update doctor: ${error.message}`,
      );
    }
  }
}
