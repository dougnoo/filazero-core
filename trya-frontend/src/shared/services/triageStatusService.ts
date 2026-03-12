/**
 * Triage Status Service
 *
 * Service for fetching triage validation status from the backend.
 */

import { api } from "./api";

export interface AssignedDoctor {
  name: string;
  boardCode?: string;
  boardNumber?: string;
  boardState?: string;
}

export interface TriageValidationStatus {
  /** Se há validação em andamento */
  hasValidation: boolean;
  /** Status atual: PENDING, IN_REVIEW, APPROVED, ADJUSTED */
  status?: "PENDING" | "IN_REVIEW" | "APPROVED" | "ADJUSTED";
  /** Dados do médico responsável, se houver */
  assignedDoctor?: AssignedDoctor;
  /** Data de criação da solicitação */
  createdAt?: string;
  /** Data de atualização da solicitação */
  updatedAt?: string;
}

class TriageStatusService {
  /**
   * Busca o status de validação médica da triagem do usuário
   */
  async getValidationStatus(): Promise<TriageValidationStatus> {
    try {
      const response = await api.get<TriageValidationStatus>(
        "/api/triage-status/validation"
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar status de validação:", error);
      // Retorna sem validação em caso de erro
      return { hasValidation: false };
    }
  }

  /**
   * Formata o CRM/registro do médico para exibição
   */
  formatDoctorBoard(doctor: AssignedDoctor): string {
    if (!doctor.boardCode || !doctor.boardNumber) {
      return "";
    }

    const parts = [doctor.boardCode, doctor.boardNumber];
    if (doctor.boardState) {
      parts.push(doctor.boardState);
    }

    return parts.join(" ");
  }

  /**
   * Retorna uma descrição do status em português
   */
  getStatusDescription(
    status?: "PENDING" | "IN_REVIEW" | "APPROVED" | "ADJUSTED"
  ): string {
    switch (status) {
      case "PENDING":
        return "Aguardando revisão médica";
      case "IN_REVIEW":
        return "Em análise pelo médico";
      case "APPROVED":
        return "Aprovado pelo médico";
      case "ADJUSTED":
        return "Ajustado pelo médico";
      default:
        return "";
    }
  }
}

export const triageStatusService = new TriageStatusService();

