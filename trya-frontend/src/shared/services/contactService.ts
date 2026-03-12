/**
 * Contact Service
 *
 * Service for sending contact messages from beneficiaries to Trya.
 */

import { api } from "./api";

export interface SendContactMessageDto {
  subject: string;
  message: string;
}

export interface SendContactMessageResponse {
  success: boolean;
}

/**
 * Contact Service
 */
class ContactService {
  /**
   * Send a contact message to Trya support
   */
  async sendMessage(
    dto: SendContactMessageDto
  ): Promise<SendContactMessageResponse> {
    try {
      const response = await api.post<SendContactMessageResponse>(
        "/api/contact",
        dto,
        "Erro ao enviar mensagem"
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const contactService = new ContactService();
