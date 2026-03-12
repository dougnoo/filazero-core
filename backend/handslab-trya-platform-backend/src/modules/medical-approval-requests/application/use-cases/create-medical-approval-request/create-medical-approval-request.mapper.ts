import { MedicalApprovalRequest } from '../../../domain/entities/medical-approval-request.entity';
import { ImageAnalysis } from '../../../domain/entities/image-analysis.entity';
import { Attachment } from '../../../domain/entities/attachment.entity';
import { Symptom } from '../../../domain/entities/symptom.entity';
import {
  SuggestedExam,
  ExamSuggestedBy,
} from '../../../domain/entities/suggested-exam.entity';
import {
  CareInstruction,
  InstructionProvidedBy,
} from '../../../domain/entities/care-instruction.entity';
import { CreateMedicalApprovalRequestDto } from './create-medical-approval-request.dto';
import { CreateMedicalApprovalRequestResponseDto } from './create-medical-approval-request-response.dto';

export class CreateMedicalApprovalRequestMapper {
  static toDomain(
    dto: CreateMedicalApprovalRequestDto,
  ): MedicalApprovalRequest {
    // Convert symptoms array to Symptom entities
    const allSymptoms: Symptom[] = [];

    // Add main symptoms
    dto.patient_data.medical_summary.main_symptoms.forEach((symptom) => {
      allSymptoms.push(
        Symptom.create({
          description: symptom,
          isMain: true,
        }),
      );
    });

    // Add other symptoms
    dto.patient_data.symptoms?.forEach((symptom) => {
      allSymptoms.push(
        Symptom.create({
          description: symptom,
          isMain: false,
        }),
      );
    });

    // Convert suggested exams to SuggestedExam entities
    const suggestedExams = dto.patient_data.medical_summary.suggested_exams.map(
      (exam) =>
        SuggestedExam.create({
          examName: exam,
          suggestedBy: ExamSuggestedBy.AI,
        }),
    );

    // Convert care instructions to CareInstruction entities
    const careInstructions =
      dto.patient_data.medical_summary.basic_care_instructions.map(
        (instruction) =>
          CareInstruction.create({
            instruction: instruction,
            providedBy: InstructionProvidedBy.AI,
          }),
      );

    return MedicalApprovalRequest.create({
      sessionId: dto.session_id,
      userId: dto.user_id,
      tenantId: dto.tenant_id,
      patientName: dto.patient_name,
      urgencyLevel: dto.patient_data.medical_summary.urgency_level,
      chiefComplaint: dto.patient_data.medical_summary.chief_complaint,
      conversationSummary:
        dto.patient_data.medical_summary.conversation_summary,
      careRecommendation: dto.patient_data.medical_summary.care_recommendation,
      symptoms: allSymptoms,
      suggestedExams: suggestedExams,
      careInstructions: careInstructions,
      imageAnalyses: dto.patient_data.image_analyses?.map((analysisDto) =>
        ImageAnalysis.create({
          timestamp: new Date(analysisDto.timestamp),
          numImages: analysisDto.num_images,
          context: analysisDto.context,
          userResponse: analysisDto.user_response,
          detailedAnalysis: analysisDto.detailed_analysis,
        }),
      ),
      attachments: dto.patient_data.attachments?.map((attachmentDto) =>
        Attachment.create({
          s3Key: attachmentDto.s3_key,
          originalName: attachmentDto.original_name,
          fileType: this.getFileTypeFromName(attachmentDto.original_name),
        }),
      ),
    });
  }

  static toResponseDto(
    request: MedicalApprovalRequest,
  ): CreateMedicalApprovalRequestResponseDto {
    return {
      id: request.id,
      session_id: request.sessionId,
      patient_name: request.patientName,
      status: request.status,
      urgency_level: request.urgencyLevel,
      created_at: request.createdAt.toISOString(),
    };
  }

  private static getFileTypeFromName(originalName: string): string {
    const extension = originalName.split('.').pop()?.toLowerCase();

    if (!extension) return 'unknown';

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt'];

    if (imageExtensions.includes(extension)) return 'image';
    if (documentExtensions.includes(extension)) return 'document';

    return 'unknown';
  }
}
