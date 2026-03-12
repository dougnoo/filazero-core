import { ImageAnalysis } from '../../domain/entities/image-analysis.entity';
import { ImageAnalysisEntity } from '../entities/image-analysis.entity';

export class ImageAnalysisMapper {
  static toDomain(entity: ImageAnalysisEntity): ImageAnalysis {
    return ImageAnalysis.reconstitute({
      id: entity.id,
      medicalApprovalRequestId: entity.medicalApprovalRequestId,
      timestamp: entity.timestamp,
      numImages: entity.numImages,
      context: entity.context,
      userResponse: entity.userResponse,
      detailedAnalysis: entity.detailedAnalysis,
      createdAt: entity.createdAt,
    });
  }

  static toEntity(domain: ImageAnalysis): ImageAnalysisEntity {
    const entity = new ImageAnalysisEntity();
    if (domain.id) {
      entity.id = domain.id;
    }
    if (domain.medicalApprovalRequestId) {
      entity.medicalApprovalRequestId = domain.medicalApprovalRequestId;
    }
    entity.timestamp = domain.timestamp;
    entity.numImages = domain.numImages;
    entity.context = domain.context;
    entity.userResponse = domain.userResponse;
    entity.detailedAnalysis = domain.detailedAnalysis;
    entity.createdAt = domain.createdAt;
    return entity;
  }

  static toDomainArray(entities: ImageAnalysisEntity[]): ImageAnalysis[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  static toEntityArray(domains: ImageAnalysis[]): ImageAnalysisEntity[] {
    return domains.map((domain) => this.toEntity(domain));
  }
}
