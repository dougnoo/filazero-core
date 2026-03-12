import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEvent } from '../../../database/entities/audit-event.entity';
import {
  IAuditRepository,
  CreateAuditEventData,
} from '../../domain/repositories/audit.repository.interface';

@Injectable()
export class TypeOrmAuditRepository implements IAuditRepository {
  private readonly logger = new Logger(TypeOrmAuditRepository.name);

  constructor(
    @InjectRepository(AuditEvent)
    private readonly repo: Repository<AuditEvent>,
  ) {}

  async create(data: CreateAuditEventData): Promise<void> {
    try {
      const event = this.repo.create({
        eventType: data.eventType,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId,
        payload: data.payload,
      });
      await this.repo.save(event);
      this.logger.debug(
        `Audit event created: ${data.eventType} for ${data.entityType}:${data.entityId}`,
      );
    } catch (error) {
      // Não falhar a operação principal por erro de auditoria
      this.logger.error(`Failed to create audit event: ${error}`, error);
    }
  }
}
