import {
  CareInstruction,
  InstructionProvidedBy,
} from '../../domain/entities/care-instruction.entity';
import { CareInstructionEntity } from '../entities/care-instruction.entity';

export class CareInstructionMapper {
  static toDomain(entity: CareInstructionEntity): CareInstruction {
    return new CareInstruction({
      id: entity.id,
      medicalApprovalRequestId: entity.medicalApprovalRequestId,
      instruction: entity.instruction,
      providedBy: entity.providedBy as InstructionProvidedBy,
      createdAt: entity.createdAt,
    });
  }

  static toEntity(domain: CareInstruction): CareInstructionEntity {
    const entity = new CareInstructionEntity();
    if (domain.id) {
      entity.id = domain.id;
    }
    entity.medicalApprovalRequestId = domain.medicalApprovalRequestId;
    entity.instruction = domain.instruction;
    entity.providedBy = domain.providedBy;
    entity.createdAt = domain.createdAt;
    return entity;
  }

  static toDomainArray(entities: CareInstructionEntity[]): CareInstruction[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  static toEntityArray(domains: CareInstruction[]): CareInstructionEntity[] {
    return domains.map((domain) => this.toEntity(domain));
  }
}
