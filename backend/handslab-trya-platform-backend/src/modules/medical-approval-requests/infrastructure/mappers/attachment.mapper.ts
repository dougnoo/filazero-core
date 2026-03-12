import { Attachment } from '../../domain/entities/attachment.entity';
import { AttachmentEntity } from '../entities/attachment.entity';

export class AttachmentMapper {
  static toDomain(entity: AttachmentEntity): Attachment {
    return Attachment.reconstitute({
      id: entity.id,
      medicalApprovalRequestId: entity.medicalApprovalRequestId,
      s3Key: entity.s3Key,
      originalName: entity.originalName,
      fileType: entity.fileType,
      createdAt: entity.createdAt,
    });
  }

  static toEntity(domain: Attachment): AttachmentEntity {
    const entity = new AttachmentEntity();
    if (domain.id) {
      entity.id = domain.id;
    }
    if (domain.medicalApprovalRequestId) {
      entity.medicalApprovalRequestId = domain.medicalApprovalRequestId;
    }
    entity.s3Key = domain.s3Key;
    entity.originalName = domain.originalName;
    entity.fileType = domain.fileType;
    entity.createdAt = domain.createdAt;
    return entity;
  }

  static toDomainArray(entities: AttachmentEntity[]): Attachment[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  static toEntityArray(domains: Attachment[]): AttachmentEntity[] {
    return domains.map((domain) => this.toEntity(domain));
  }
}
