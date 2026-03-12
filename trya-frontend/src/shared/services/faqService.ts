/**
 * FAQ Service
 *
 * Service for FAQ API integration.
 * Handles listing FAQ topics by category and asking questions to the AI.
 */

import { api } from "./api";
import type {
  FaqCategory,
  FaqTopicsResponseDto,
  AskFaqDto,
  FaqResponseDto,
} from "../types/faq";

/**
 * FAQ Service
 */
class FaqService {
  /**
   * List FAQ topics by category
   */
  async listTopics(category: FaqCategory): Promise<FaqTopicsResponseDto> {
    try {
      const response = await api.get<FaqTopicsResponseDto>(
        `/api/faq/topics?category=${category}`,
        "Erro ao buscar tópicos de FAQ"
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Ask a question to the FAQ AI
   */
  async ask(dto: AskFaqDto): Promise<FaqResponseDto> {
    try {
      const response = await api.post<FaqResponseDto>(
        "/api/faq/ask",
        dto,
        "Erro ao enviar pergunta"
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const faqService = new FaqService();

