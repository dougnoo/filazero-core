/**
 * Prescription Service
 * 
 * Service for managing prescriptions through the Platform API.
 * Handles saving prescription data received from Memed integration.
 */

import { platformApi } from './platformApi';

export interface CreatePrescriptionRequest {
  memedToken: string;
  memedPrescriptionId: string; // data.prescricao.id from Memed
  doctorId: string;
  patientId: string;
  patientName: string;
  sessionId?: string; // session_id from MAR details
  // Optional fields
  tenantId?: string;
  patientCpf?: string;
}

export interface PrescriptionResponse {
  id: string;
  memedPrescriptionId: string;
  tenantId?: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  patientCpf?: string;
  sessionId?: string;
  medications?: any[];
  exams?: any[];
  pdfUrl?: string;
  sentVia?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt?: string;
}

class PrescriptionService {
  /**
   * Save a prescription to the database
   */
  async savePrescription(data: CreatePrescriptionRequest): Promise<PrescriptionResponse> {
    try {
      const response = await platformApi.post<PrescriptionResponse>(
        '/prescriptions',
        data,
        'Erro ao salvar prescrição'
      );
      return response;
    } catch (error) {
      console.error('Error saving prescription:', error);
      throw error;
    }
  }

  /**
   * Get prescription by ID
   */
  async getPrescription(id: string): Promise<PrescriptionResponse> {
    try {
      const response = await platformApi.get<PrescriptionResponse>(
        `/prescriptions/${id}`,
        'Erro ao buscar prescrição'
      );
      return response;
    } catch (error) {
      console.error('Error getting prescription:', error);
      throw error;
    }
  }

  /**
   * List prescriptions by doctor
   */
  async listPrescriptionsByDoctor(doctorId: string): Promise<PrescriptionResponse[]> {
    try {
      const response = await platformApi.get<PrescriptionResponse[]>(
        `/prescriptions?doctorId=${doctorId}`,
        'Erro ao buscar prescrições'
      );
      return response;
    } catch (error) {
      console.error('Error listing prescriptions:', error);
      throw error;
    }
  }

  /**
   * Get prescription by medical approval request ID (sessionId)
   */
  async getPrescriptionBySession(sessionId: string): Promise<PrescriptionResponse | null> {
    try {
      const response = await platformApi.get<PrescriptionResponse | null>(
        `/prescriptions/by-session/${sessionId}`,
        'Erro ao buscar prescrição do atendimento'
      );
      return response;
    } catch (error) {
      console.error('Error getting prescription by session:', error);
      // Return null if not found instead of throwing
      return null;
    }
  }
}

export const prescriptionService = new PrescriptionService();