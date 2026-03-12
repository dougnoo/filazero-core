import { Symptom } from '../../domain/entities/symptom.entity';
import { SymptomEntity } from '../entities/symptom.entity';

export class SymptomMapper {
  static toDomain(entity: SymptomEntity): Symptom {
    return new Symptom({
      id: entity.id,
      medicalApprovalRequestId: entity.medicalApprovalRequestId,
      description: entity.description,
      isMain: entity.isMain,
      createdAt: entity.createdAt,
    });
  }

  static toEntity(domain: Symptom): SymptomEntity {
    const entity = new SymptomEntity();
    if (domain.id) {
      entity.id = domain.id;
    }
    entity.medicalApprovalRequestId = domain.medicalApprovalRequestId;
    entity.description = domain.description;
    entity.isMain = domain.isMain;
    entity.createdAt = domain.createdAt;
    return entity;
  }

  static toDomainArray(entities: SymptomEntity[]): Symptom[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  static toEntityArray(domains: Symptom[]): SymptomEntity[] {
    return domains.map((domain) => this.toEntity(domain));
  }
}
