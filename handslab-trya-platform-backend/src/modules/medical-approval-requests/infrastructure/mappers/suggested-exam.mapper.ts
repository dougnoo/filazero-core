import {
  SuggestedExam,
  ExamSuggestedBy,
} from '../../domain/entities/suggested-exam.entity';
import { SuggestedExamEntity } from '../entities/suggested-exam.entity';

export class SuggestedExamMapper {
  static toDomain(entity: SuggestedExamEntity): SuggestedExam {
    return new SuggestedExam({
      id: entity.id,
      medicalApprovalRequestId: entity.medicalApprovalRequestId,
      examName: entity.examName,
      suggestedBy: entity.suggestedBy as ExamSuggestedBy,
      createdAt: entity.createdAt,
    });
  }

  static toEntity(domain: SuggestedExam): SuggestedExamEntity {
    const entity = new SuggestedExamEntity();
    if (domain.id) {
      entity.id = domain.id;
    }
    entity.medicalApprovalRequestId = domain.medicalApprovalRequestId;
    entity.examName = domain.examName;
    entity.suggestedBy = domain.suggestedBy;
    entity.createdAt = domain.createdAt;
    return entity;
  }

  static toDomainArray(entities: SuggestedExamEntity[]): SuggestedExam[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  static toEntityArray(domains: SuggestedExam[]): SuggestedExamEntity[] {
    return domains.map((domain) => this.toEntity(domain));
  }
}
