/**
 * Medical Approval Requests Service
 *
 * Service for managing medical approval requests via Platform API.
 * Handles listing and assigning medical approval requests to doctors.
 */

import { platformApi } from "./platformApi";
import { buildQueryParams } from "@/shared/utils";
import type {
  ListMedicalApprovalRequestsParams,
  ListMedicalApprovalRequestsResponse,
  AssignMedicalApprovalRequestResponse,
  MedicalApprovalRequest,
  BeneficiaryDetails,
  AttachmentDetails,
  AttachmentDownloadResponse,
} from "../../app/(platform-authenticated)/medico/types";

export interface ApproveMedicalApprovalRequest {
  status: 'APPROVED' | 'ADJUSTED';
  doctorNotes?: string;
}

export interface ApproveMedicalApprovalResponse {
  id: string;
  status: 'APPROVED' | 'ADJUSTED';
  doctorNotes?: string;
  updatedAt: string;
}

export interface PatientHistoryItem {
  id: string;
  sessionId: string;
  chiefComplaint: string;
  createdAt: string;
}

export interface PatientHistoryResponse {
  history: PatientHistoryItem[];
}

/**
 * Medical Approval Requests Service
 */
class MedicalApprovalRequestsService {
  /**
   * List medical approval requests with optional filters and pagination
   */
  async list(
    params?: ListMedicalApprovalRequestsParams
  ): Promise<ListMedicalApprovalRequestsResponse> {
    const queryString = buildQueryParams({
      ...(params || {}),
    });
    const endpoint = `/medical-approval-requests${queryString}`;

    const response = await platformApi.get<ListMedicalApprovalRequestsResponse>(
      endpoint,
      "Erro ao buscar solicitações de aprovação médica"
    );

    return response;
  }

  /**
   * Assign a medical approval request to the current doctor
   */
  async assign(
    requestId: string
  ): Promise<AssignMedicalApprovalRequestResponse> {
    const response =
      await platformApi.post<AssignMedicalApprovalRequestResponse>(
        `/medical-approval-requests/${requestId}/assign`,
        undefined,
        "Erro ao atribuir solicitação de aprovação médica"
      );

    return response;
  }

  /**
   * Get medical approval request by ID
   */
  async getById(requestId: string): Promise<MedicalApprovalRequest> {
    const response = await platformApi.get<MedicalApprovalRequest>(
      `/medical-approval-requests/${requestId}`,
      "Erro ao buscar solicitação de aprovação médica"
    );

    return response;
  }

  /**
   * Get beneficiary details for a medical approval request
   */
  async getBeneficiaryDetails(requestId: string): Promise<BeneficiaryDetails> {
    const response = await platformApi.get<BeneficiaryDetails>(
      `/medical-approval-requests/${requestId}/beneficiary-details`,
      "Erro ao buscar detalhes do beneficiário"
    );

    return response;
  }



  /**
   * Get presigned download URL for a medical approval request attachment
   * Used only for generating secure download links
   */
  async getAttachmentDownloadUrl(
    requestId: string,
    attachmentId: string
  ): Promise<AttachmentDownloadResponse> {
    const response = await platformApi.get<AttachmentDownloadResponse>(
      `/medical-approval-requests/${requestId}/attachments/${attachmentId}`,
      "Erro ao obter URL de download do anexo"
    );

    return response;
  }

  /**
   * Approve or adjust a medical approval request
   */
  async approve(
    requestId: string, 
    data: ApproveMedicalApprovalRequest
  ): Promise<ApproveMedicalApprovalResponse> {
    try {
      const response = await platformApi.post<ApproveMedicalApprovalResponse>(
        `/medical-approval-requests/${requestId}/approve`,
        data,
        'Erro ao aprovar atendimento'
      );
      return response;
    } catch (error) {
      console.error('Error approving medical approval request:', error);
      throw error;
    }
  }

  /**
   * Get patient history (previous evaluations)
   */
  async getPatientHistory(patientId: string): Promise<PatientHistoryResponse> {
    const response = await platformApi.get<PatientHistoryResponse>(
      `/medical-approval-requests/patient/${patientId}/history`,
      "Erro ao buscar histórico do paciente"
    );

    return response;
  }
}

export const medicalApprovalRequestsService =
  new MedicalApprovalRequestsService();
