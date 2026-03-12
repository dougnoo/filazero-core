/**
 * Medical Approval Requests Service
 *
 * Service for managing medical approval requests via Platform API.
 * Handles listing and assigning medical approval requests to doctors.
 */

import { platformApi } from "./platformApi";
import type {
  ListMedicalApprovalRequestsParams,
  ListMedicalApprovalRequestsResponse,
  AssignMedicalApprovalRequestResponse,
  MedicalApprovalRequest,
  BeneficiaryDetails,
  AttachmentDetails,
  AttachmentDownloadResponse,
} from "../../app/(platform-authenticated)/medico/types";

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
    // Build query string from params
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/medical-approval-requests?${queryString}`
      : "/medical-approval-requests";

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
}

export const medicalApprovalRequestsService =
  new MedicalApprovalRequestsService();
