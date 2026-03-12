import { ApprovalStatus } from '../enums/approval-status.enum';
import { UrgencyLevel } from '../enums/urgency-level.enum';
import { ImageAnalysis } from './image-analysis.entity';
import { Attachment } from './attachment.entity';
import { Symptom } from './symptom.entity';
import { SuggestedExam } from './suggested-exam.entity';
import { CareInstruction } from './care-instruction.entity';

export class MedicalApprovalRequest {
  id: string;
  sessionId: string;
  userId: string;
  tenantId: string;
  patientName: string;
  status: ApprovalStatus;
  assignedDoctorId?: string;
  urgencyLevel: UrgencyLevel;
  chiefComplaint: string;
  conversationSummary: string;
  careRecommendation: string;
  doctorNotes: string;
  symptoms: Symptom[];
  suggestedExams: SuggestedExam[];
  careInstructions: CareInstruction[];
  imageAnalyses: ImageAnalysis[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;

  private constructor(data: {
    id?: string;
    sessionId: string;
    userId: string;
    tenantId: string;
    patientName: string;
    status?: ApprovalStatus;
    assignedDoctorId?: string;
    urgencyLevel: UrgencyLevel;
    chiefComplaint: string;
    conversationSummary: string;
    careRecommendation: string;
    doctorNotes?: string;
    symptoms?: Symptom[];
    suggestedExams?: SuggestedExam[];
    careInstructions?: CareInstruction[];
    imageAnalyses?: ImageAnalysis[];
    attachments?: Attachment[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id || '';
    this.sessionId = data.sessionId;
    this.userId = data.userId;
    this.tenantId = data.tenantId;
    this.patientName = data.patientName;
    this.status = data.status || ApprovalStatus.PENDING;
    this.assignedDoctorId = data.assignedDoctorId;
    this.urgencyLevel = data.urgencyLevel;
    this.chiefComplaint = data.chiefComplaint;
    this.conversationSummary = data.conversationSummary;
    this.careRecommendation = data.careRecommendation;
    this.doctorNotes = data.doctorNotes || '';
    this.symptoms = data.symptoms || [];
    this.suggestedExams = data.suggestedExams || [];
    this.careInstructions = data.careInstructions || [];
    this.imageAnalyses = data.imageAnalyses || [];
    this.attachments = data.attachments || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static create(data: {
    sessionId: string;
    userId: string;
    tenantId: string;
    patientName: string;
    urgencyLevel: UrgencyLevel;
    chiefComplaint: string;
    conversationSummary: string;
    careRecommendation: string;
    symptoms?: Symptom[];
    suggestedExams?: SuggestedExam[];
    careInstructions?: CareInstruction[];
    imageAnalyses?: ImageAnalysis[];
    attachments?: Attachment[];
  }): MedicalApprovalRequest {
    return new MedicalApprovalRequest({
      ...data,
      status: ApprovalStatus.PENDING,
    });
  }

  static reconstitute(data: {
    id: string;
    sessionId: string;
    userId: string;
    tenantId: string;
    patientName: string;
    status: ApprovalStatus;
    assignedDoctorId?: string;
    urgencyLevel: UrgencyLevel;
    chiefComplaint: string;
    conversationSummary: string;
    careRecommendation: string;
    doctorNotes?: string;
    symptoms: Symptom[];
    suggestedExams: SuggestedExam[];
    careInstructions: CareInstruction[];
    imageAnalyses: ImageAnalysis[];
    attachments: Attachment[];
    createdAt: Date;
    updatedAt: Date;
  }): MedicalApprovalRequest {
    return new MedicalApprovalRequest(data);
  }
}
