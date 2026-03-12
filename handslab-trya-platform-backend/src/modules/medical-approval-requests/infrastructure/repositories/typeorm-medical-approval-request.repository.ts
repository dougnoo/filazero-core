import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IMedicalApprovalRequestRepository } from '../../domain/repositories/medical-approval-request.repository.interface';
import { MedicalApprovalRequest } from '../../domain/entities/medical-approval-request.entity';
import { MedicalApprovalRequestEntity } from '../entities/medical-approval-request.entity';
import { MedicalApprovalRequestMapper } from '../mappers/medical-approval-request.mapper';
import { OrderBy } from '../../domain/enums/order-by.enum';
import { OrderDirection } from '../../domain/enums/order-direction.enum';

@Injectable()
export class TypeORMMedicalApprovalRequestRepository implements IMedicalApprovalRequestRepository {
  constructor(
    @InjectRepository(MedicalApprovalRequestEntity)
    private readonly medicalApprovalRequestRepository: Repository<MedicalApprovalRequestEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findBySessionId(
    sessionId: string,
  ): Promise<MedicalApprovalRequest | null> {
    const entity = await this.medicalApprovalRequestRepository.findOne({
      where: { sessionId },
      relations: [
        'imageAnalyses',
        'attachments',
        'symptoms',
        'suggestedExams',
        'careInstructions',
      ],
    });

    if (!entity) {
      return null;
    }

    return MedicalApprovalRequestMapper.toDomain(entity);
  }

  async findById(id: string): Promise<MedicalApprovalRequest | null> {
    const entity = await this.medicalApprovalRequestRepository.findOne({
      where: { id },
      relations: [
        'imageAnalyses',
        'attachments',
        'symptoms',
        'suggestedExams',
        'careInstructions',
        'assignedDoctor',
      ],
    });

    if (!entity) {
      return null;
    }

    return MedicalApprovalRequestMapper.toDomain(entity);
  }

  async findByPatientId(patientId: string): Promise<MedicalApprovalRequest[]> {
    const entities = await this.medicalApprovalRequestRepository.find({
      where: { userId: patientId },
      relations: [
        'imageAnalyses',
        'attachments',
        'symptoms',
        'suggestedExams',
        'careInstructions',
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    return entities.map((entity) =>
      MedicalApprovalRequestMapper.toDomain(entity),
    );
  }

  async findAll(
    filters: {
      status?: string;
      urgencyLevel?: string;
      patientName?: string;
      date?: string;
      orderBy?: OrderBy;
      orderDirection?: OrderDirection;
    },
    pagination: {
      page: number;
      limit: number;
    },
  ): Promise<{
    data: MedicalApprovalRequest[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const queryBuilder = this.medicalApprovalRequestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.imageAnalyses', 'imageAnalyses')
      .leftJoinAndSelect('request.attachments', 'attachments');

    if (filters.status) {
      queryBuilder.andWhere('request.status = :status', {
        status: filters.status,
      });
    }

    if (filters.urgencyLevel) {
      queryBuilder.andWhere('request.urgencyLevel = :urgencyLevel', {
        urgencyLevel: filters.urgencyLevel,
      });
    }

    if (filters.patientName) {
      queryBuilder.andWhere('LOWER(request.patientName) LIKE LOWER(:name)', {
        name: `%${filters.patientName}%`,
      });
    }

    if (filters.date) {
      queryBuilder.andWhere('DATE(request.createdAt) = :date', {
        date: filters.date,
      });
    }

    // Ordenação por prioridade: urgência e tempo de espera (padrão quando não há filtros)
    const hasFilters =
      filters.status ||
      filters.urgencyLevel ||
      filters.patientName ||
      filters.date;

    if (!hasFilters && filters.orderBy === OrderBy.URGENCY_AND_TIME) {
      queryBuilder
        .addSelect(
          `CASE 
            WHEN request.status = 'PENDING' THEN 1 
            WHEN request.status = 'IN_REVIEW' THEN 2 
            ELSE 3 
          END`,
          'status_priority',
        )
        .addSelect(
          `CASE 
            WHEN request.urgencyLevel = 'EMERGENCY' THEN 1 
            WHEN request.urgencyLevel = 'VERY_URGENT' THEN 2 
            WHEN request.urgencyLevel = 'URGENT' THEN 3 
            WHEN request.urgencyLevel = 'STANDARD' THEN 4 
            WHEN request.urgencyLevel = 'NON_URGENT' THEN 5 
            ELSE 6 
          END`,
          'urgency_priority',
        )
        .orderBy('status_priority', 'ASC')
        .addOrderBy('urgency_priority', 'ASC')
        .addOrderBy('request.createdAt', 'ASC');
    } else {
      const dbField =
        filters.orderBy === OrderBy.CREATED_AT
          ? 'createdAt'
          : filters.orderBy === OrderBy.UPDATED_AT
            ? 'updatedAt'
            : 'createdAt';
      queryBuilder.orderBy(
        `request.${dbField}`,
        filters.orderDirection || OrderDirection.DESC,
      );
    }

    const [entities, total] = await queryBuilder
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .getManyAndCount();

    const data = entities.map((entity) =>
      MedicalApprovalRequestMapper.toDomain(entity),
    );

    return {
      data,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async create(
    request: MedicalApprovalRequest,
  ): Promise<MedicalApprovalRequest> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entity = MedicalApprovalRequestMapper.toEntity(request);

      // Save the main entity with cascading to related entities
      const savedEntity = await queryRunner.manager.save(
        MedicalApprovalRequestEntity,
        entity,
      );

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Load the saved entity with relations
      const entityWithRelations =
        await this.medicalApprovalRequestRepository.findOne({
          where: { id: savedEntity.id },
          relations: [
            'imageAnalyses',
            'attachments',
            'symptoms',
            'suggestedExams',
            'careInstructions',
          ],
        });

      return MedicalApprovalRequestMapper.toDomain(entityWithRelations!);
    } catch (error) {
      // Rollback the transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async save(request: MedicalApprovalRequest): Promise<MedicalApprovalRequest> {
    const entity = MedicalApprovalRequestMapper.toEntity(request);

    const savedEntity =
      await this.medicalApprovalRequestRepository.save(entity);

    // Load the saved entity with relations
    const entityWithRelations =
      await this.medicalApprovalRequestRepository.findOne({
        where: { id: savedEntity.id },
        relations: [
          'imageAnalyses',
          'attachments',
          'symptoms',
          'suggestedExams',
          'careInstructions',
        ],
      });

    return MedicalApprovalRequestMapper.toDomain(entityWithRelations!);
  }
}
