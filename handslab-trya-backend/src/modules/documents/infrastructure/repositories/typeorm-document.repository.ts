import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import {
  MedicalDocument,
  MedicalDocumentType,
} from '../../../../database/entities/medical-document.entity';
import type {
  IDocumentRepository,
  CreateDocumentData,
  ListDocumentsFilters,
  PaginatedDocuments,
} from '../../domain/repositories/document.repository.interface';

@Injectable()
export class TypeOrmDocumentRepository implements IDocumentRepository {
  private readonly logger = new Logger(TypeOrmDocumentRepository.name);

  constructor(
    @InjectRepository(MedicalDocument)
    private readonly documentRepository: Repository<MedicalDocument>,
  ) {}

  async create(data: CreateDocumentData): Promise<MedicalDocument> {
    const document = this.documentRepository.create({
      tenantId: data.tenantId,
      ownerUserId: data.ownerUserId,
      memberUserId: data.memberUserId,
      documentType: data.documentType,
      category: data.category,
      title: data.title,
      issueDate: data.issueDate,
      validUntil: data.validUntil,
      notes: data.notes,
      fileName: data.fileName,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      s3Key: data.s3Key,
    });

    const saved = await this.documentRepository.save(document);
    this.logger.log(`Documento criado: ${saved.id}`);
    return saved;
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<MedicalDocument | null> {
    return (
      (await this.documentRepository.findOne({
        where: { id, tenantId },
        relations: ['member'],
      })) || null
    );
  }

  async findByIdWithOwnerCheck(
    id: string,
    tenantId: string,
    ownerUserId: string,
  ): Promise<MedicalDocument | null> {
    return (
      (await this.documentRepository.findOne({
        where: { id, tenantId, ownerUserId },
        relations: ['member'],
      })) || null
    );
  }

  async list(filters: ListDocumentsFilters): Promise<PaginatedDocuments> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const qb = this.documentRepository
      .createQueryBuilder('doc')
      .where('doc.tenant_id = :tenantId', { tenantId: filters.tenantId })
      .andWhere('doc.owner_user_id = :ownerUserId', {
        ownerUserId: filters.ownerUserId,
      })
      .andWhere('doc.member_user_id = :memberUserId', {
        memberUserId: filters.memberUserId,
      });

    if (filters.documentType) {
      qb.andWhere('doc.document_type = :documentType', {
        documentType: filters.documentType,
      });
    }

    if (filters.status) {
      const today = new Date();
      if (filters.status === 'EXPIRED') {
        qb.andWhere('doc.valid_until IS NOT NULL')
          .andWhere('doc.valid_until < :today', { today });
      } else if (filters.status === 'VALID') {
        qb.andWhere(
          new Brackets((sub) => {
            sub
              .where('doc.valid_until IS NULL')
              .orWhere('doc.valid_until >= :today', { today });
          }),
        );
      }
    }

    if (filters.search) {
      const pattern = `%${filters.search}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(doc.title) LIKE LOWER(:pattern)', { pattern })
            .orWhere('LOWER(doc.category) LIKE LOWER(:pattern)', { pattern });
        }),
      );
    }

    if (filters.issueDateFrom) {
      qb.andWhere('doc.issue_date >= :issueDateFrom', {
        issueDateFrom: filters.issueDateFrom,
      });
    }

    if (filters.issueDateTo) {
      qb.andWhere('doc.issue_date <= :issueDateTo', {
        issueDateTo: filters.issueDateTo,
      });
    }

    qb.orderBy('doc.issue_date', 'DESC').addOrderBy('doc.created_at', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Carregar a relação member separadamente
    if (data.length > 0) {
      await Promise.all(
        data.map(async (doc) => {
          const member = await this.documentRepository.manager.findOne('User', {
            where: { id: doc.memberUserId },
            select: ['id', 'name', 'cpf'],
          } as any);
          if (member) {
            doc.member = member as any;
          }
        }),
      );
    }

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.documentRepository.delete({ id, tenantId });
    this.logger.log(`Documento deletado: ${id}`);
  }
}
