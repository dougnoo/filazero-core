import { Inject, Injectable } from '@nestjs/common';
import type { IMedicalApprovalRequestRepository } from '../../../domain/repositories/medical-approval-request.repository.interface';
import { MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN } from '../../../domain/repositories/medical-approval-request.repository.token';
import { MedicalApprovalRequestNotFoundError } from '../../../domain/errors/medical-approval-request-not-found.error';
import { GetMedicalApprovalRequestResponseDto } from './get-medical-approval-request-response.dto';

@Injectable()
export class GetMedicalApprovalRequestUseCase {
  constructor(
    @Inject(MEDICAL_APPROVAL_REQUEST_REPOSITORY_TOKEN)
    private readonly repository: IMedicalApprovalRequestRepository,
  ) {}

  async execute(id: string): Promise<GetMedicalApprovalRequestResponseDto> {
    const request = await this.repository.findById(id);

    if (!request) {
      throw new MedicalApprovalRequestNotFoundError(id);
    }

    return {
      id: request.id,
      sessionId: request.sessionId,
      userId: request.userId,
      patientName: request.patientName,
      chiefComplaint: request.chiefComplaint,
      conversationSummary: request.conversationSummary,
      careRecommendation: request.careRecommendation,
      status: request.status,
      urgencyLevel: request.urgencyLevel,
      createdAt: request.createdAt,
      assignedDoctorId: request.assignedDoctorId,
      careInstructions: request.careInstructions.map((ci) => ci.instruction),
      doctorNotes: request.doctorNotes,
      imageAnalyses: request.imageAnalyses.map((ia) => ({
        imageUrl: ia.context || '',
        analysis: ia.detailedAnalysis,
      })),
      suggestedExams: request.suggestedExams.map((se) => se.examName),
      symptoms: request.symptoms.map((s) => s.description),
      attachments: request.attachments.map((att) => ({
        id: att.id,
        s3Key: att.s3Key,
        originalName: att.originalName,
        fileType: att.fileType,
      })),
    };
  }
}
