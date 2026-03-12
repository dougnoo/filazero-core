import { MedicalApprovalRequest } from '../../domain/entities/medical-approval-request.entity';
import { MedicalApprovalRequestEntity } from '../entities/medical-approval-request.entity';
import { ImageAnalysisMapper } from './image-analysis.mapper';
import { AttachmentMapper } from './attachment.mapper';
import { SymptomMapper } from './symptom.mapper';
import { SuggestedExamMapper } from './suggested-exam.mapper';
import { CareInstructionMapper } from './care-instruction.mapper';

export class MedicalApprovalRequestMapper {
  static toDomain(
    entity: MedicalApprovalRequestEntity,
  ): MedicalApprovalRequest {
    return MedicalApprovalRequest.reconstitute({
      id: entity.id,
      sessionId: entity.sessionId,
      userId: entity.userId,
      tenantId: entity.tenantId,
      patientName: entity.patientName,
      status: entity.status,
      assignedDoctorId: entity.assignedDoctorId,
      urgencyLevel: entity.urgencyLevel,
      chiefComplaint: entity.chiefComplaint,
      conversationSummary: entity.conversationSummary,
      careRecommendation: entity.careRecommendation,
      doctorNotes: entity.doctorNotes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      symptoms: entity.symptoms
        ? SymptomMapper.toDomainArray(entity.symptoms)
        : [],
      suggestedExams: entity.suggestedExams
        ? SuggestedExamMapper.toDomainArray(entity.suggestedExams)
        : [],
      careInstructions: entity.careInstructions
        ? CareInstructionMapper.toDomainArray(entity.careInstructions)
        : [],
      imageAnalyses: entity.imageAnalyses
        ? ImageAnalysisMapper.toDomainArray(entity.imageAnalyses)
        : [],
      attachments: entity.attachments
        ? AttachmentMapper.toDomainArray(entity.attachments)
        : [],
    });
  }

  static toEntity(
    domain: MedicalApprovalRequest,
  ): MedicalApprovalRequestEntity {
    const entity = new MedicalApprovalRequestEntity();
    if (domain.id) {
      entity.id = domain.id;
    }
    entity.sessionId = domain.sessionId;
    entity.userId = domain.userId;
    entity.tenantId = domain.tenantId;
    entity.patientName = domain.patientName;
    entity.status = domain.status;
    entity.assignedDoctorId = domain.assignedDoctorId || undefined;
    entity.urgencyLevel = domain.urgencyLevel;
    entity.chiefComplaint = domain.chiefComplaint;
    entity.conversationSummary = domain.conversationSummary;
    entity.careRecommendation = domain.careRecommendation;
    entity.doctorNotes = domain.doctorNotes;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    // Map related entities
    entity.symptoms = domain.symptoms
      ? SymptomMapper.toEntityArray(domain.symptoms)
      : [];

    entity.suggestedExams = domain.suggestedExams
      ? SuggestedExamMapper.toEntityArray(domain.suggestedExams)
      : [];

    entity.careInstructions = domain.careInstructions
      ? CareInstructionMapper.toEntityArray(domain.careInstructions)
      : [];

    entity.imageAnalyses = domain.imageAnalyses
      ? ImageAnalysisMapper.toEntityArray(domain.imageAnalyses)
      : [];

    entity.attachments = domain.attachments
      ? AttachmentMapper.toEntityArray(domain.attachments)
      : [];

    return entity;
  }
}
