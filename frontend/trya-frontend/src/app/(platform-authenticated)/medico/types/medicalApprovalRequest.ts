/**
 * Medical Approval Request Types
 *
 * Type definitions for medical approval requests from Platform API.
 * These types match the DTOs from handslab-trya-platform-backend.
 */

// Status enum from backend DTO
export type MedicalApprovalRequestStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ADJUSTED";

// Urgency level enum from backend DTO
export type UrgencyLevel =
  | "EMERGENCY"
  | "VERY_URGENT"
  | "URGENT"
  | "STANDARD"
  | "NON_URGENT";

// List item for medical approval requests (used in tables/lists)
export interface MedicalApprovalRequestItem {
  id: string;
  patientName: string;
  chiefComplaint: string;
  date: string; // DD/MM/YYYY format
  status: MedicalApprovalRequestStatus;
  urgencyLevel?: UrgencyLevel;
  createdAt: string; // ISO 8601 format
}

// Main MAR (Medical Approval Request) data
export interface MedicalApprovalRequest {
  id: string;
  sessionId: string; // Session ID from triage chat
  userId: string; // Patient/User ID
  status: MedicalApprovalRequestStatus;
  createdAt: string;
  updatedAt: string;
  assignedDoctorId?: string; // ID of the doctor assigned to this MAR
  urgencyLevel?: UrgencyLevel;
  chiefComplaint?: string;
  conversationSummary?: string;
  careRecommendation?: string;
  imageAnalysis?: string;
  suggestedExams?: string[];
  symptoms?: string[];
  doctorNotes?: string;
  attachments?: AttachmentDetails[];
}

export interface ChronicConditions {
  name: string;
}

export interface Medications {
  name: string;
  dosage: string;
}

export interface HealthPlan {
  name: string;
  cardNumber: string;
}

// Beneficiary-specific data
export interface BeneficiaryDetails {
  id: string;
  name: string;
  cardNumber: string;
  cpf: string;
  birthDate: string;
  phone: string;
  gender: string;
  healthPlan: HealthPlan;
  // Histórico médico
  chronicConditions: ChronicConditions[];
  medications: Medications[];
  allergies: string | null;
}

// Attachment DTO from backend API
export interface AttachmentDetails {
  id: string;
  s3Key: string;
  originalName: string;
  fileType: string;
}

// Download response DTO from backend API
export interface AttachmentDownloadResponse {
  url: string;
  fileName: string;
}

// Pagination metadata
export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API request/response types
export interface ListMedicalApprovalRequestsParams {
  page?: number;
  limit?: number;
  status?: MedicalApprovalRequestStatus;
  urgencyLevel?: UrgencyLevel;
  patientName?: string;
  date?: string; // Single date filter (YYYY-MM-DD format)
}

export interface ListMedicalApprovalRequestsResponse {
  data: MedicalApprovalRequestItem[];
  pagination: PaginationMetadata;
}

export interface AssignedDoctor {
  id: string;
}

export interface AssignMedicalApprovalRequestResponse {
  id: string;
  status: string;
  assigned_doctor: AssignedDoctor;
  updated_at: string;
}

// Combined response for the details page
export interface MedicalApprovalRequestDetails {
  medicalApprovalRequest: MedicalApprovalRequest;
  beneficiary: BeneficiaryDetails;
  attachments: AttachmentDetails[];
}