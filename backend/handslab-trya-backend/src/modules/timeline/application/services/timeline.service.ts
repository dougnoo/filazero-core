import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ITimelineRepository } from '../../domain/timeline.repository.interface';
import { TIMELINE_REPOSITORY_TOKEN } from '../../domain/timeline.repository.interface';
import {
  TimelineEventType,
  TimelineEventCategory,
} from '../../../../database/entities/timeline-event.entity';
import { MedicalDocument, MedicalDocumentType } from '../../../../database/entities/medical-document.entity';
import { getDocumentTypeLabel } from '../../../documents/domain/catalog/document-catalog';
import { AlertPayload, AlertType } from '../../domain/alerts/alert-types';

@Injectable()
export class TimelineService {
  private readonly logger = new Logger(TimelineService.name);

  constructor(
    @Inject(TIMELINE_REPOSITORY_TOKEN)
    private readonly timelineRepository: ITimelineRepository,
  ) {}

  async registerDocumentUploaded(document: MedicalDocument): Promise<void> {
    try {
      const eventType = this.mapDocumentTypeToEventType(document.documentType);
      const typeLabel = getDocumentTypeLabel(document.documentType);

      await this.timelineRepository.create({
        tenantId: document.tenantId,
        memberUserId: document.memberUserId,
        eventType,
        category: TimelineEventCategory.DOCUMENT,
        title: `${typeLabel}: ${document.title}`,
        description: document.category,
        eventDate: document.issueDate,
        entityType: 'medical_documents',
        entityId: document.id,
        metadata: {
          documentType: document.documentType,
          category: document.category,
          fileName: document.fileName,
          ...(document.validUntil && { validUntil: document.validUntil.toISOString().split('T')[0] }),
        },
      });

      this.logger.log(
        `Evento de timeline criado para documento ${document.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao criar evento de timeline para documento ${document.id}`,
        error,
      );
    }
  }

  async removeDocumentEvents(documentId: string): Promise<void> {
    try {
      await this.timelineRepository.deleteByEntityId(
        'medical_documents',
        documentId,
      );
      this.logger.log(
        `Evento de timeline removido para documento ${documentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao remover evento de timeline para documento ${documentId}`,
        error,
      );
    }
  }

  async registerAlert(
    memberUserId: string,
    tenantId: string,
    payload: AlertPayload,
  ): Promise<void> {
    try {
      const eventType = this.mapAlertTypeToEventType(payload.type);
      
      await this.timelineRepository.create({
        tenantId,
        memberUserId,
        eventType,
        category: TimelineEventCategory.ALERT,
        title: payload.message.substring(0, 200), // First 200 chars as title
        description: `Prioridade: ${payload.priority}`,
        eventDate: new Date(),
        entityType: payload.entityId ? 'health_alert' : undefined,
        entityId: payload.entityId,
        metadata: {
          alertType: payload.type,
          priority: payload.priority,
          message: payload.message,
          category: payload.category,
          documentType: payload.documentType,
          expirationDaysLeft: payload.expirationDaysLeft,
        },
      });

      this.logger.log(
        `Alerta de saúde criado para membro ${memberUserId}: ${payload.type}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao criar alerta de saúde para membro ${memberUserId}`,
        error,
      );
    }
  }

  private mapAlertTypeToEventType(alertType: AlertType): TimelineEventType {
    const mapping: Record<AlertType, TimelineEventType> = {
      [AlertType.DOCUMENT_EXPIRING]: TimelineEventType.DOCUMENT_EXPIRING,
      [AlertType.DOCUMENT_EXPIRED]: TimelineEventType.DOCUMENT_EXPIRED,
      [AlertType.MISSING_VACCINATION]: TimelineEventType.MISSING_VACCINATION,
      [AlertType.MISSING_EXAM]: TimelineEventType.MISSING_EXAM,
      [AlertType.MISSING_OBLIGATION]: TimelineEventType.DOCUMENT_UPLOADED,
    };

    return mapping[alertType] || TimelineEventType.DOCUMENT_UPLOADED;
  }

  private mapDocumentTypeToEventType(
    docType: MedicalDocumentType,
  ): TimelineEventType {
    const mapping: Record<MedicalDocumentType, TimelineEventType> = {
      [MedicalDocumentType.LAB_EXAM]: TimelineEventType.LAB_EXAM,
      [MedicalDocumentType.IMAGING_EXAM]: TimelineEventType.IMAGING_EXAM,
      [MedicalDocumentType.REPORT]: TimelineEventType.MEDICAL_REPORT,
      [MedicalDocumentType.VACCINATION]: TimelineEventType.VACCINATION,
      [MedicalDocumentType.CLINICAL_FILE]: TimelineEventType.DOCUMENT_UPLOADED,
      [MedicalDocumentType.PRESCRIPTION]: TimelineEventType.PRESCRIPTION,
    };

    return mapping[docType] || TimelineEventType.DOCUMENT_UPLOADED;
  }
}
