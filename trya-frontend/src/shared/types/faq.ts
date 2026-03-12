/**
 * FAQ Types
 *
 * Types for FAQ API integration.
 */

/**
 * FAQ Category enum matching backend categories
 */
export enum FaqCategory {
  GENERAL = "GENERAL",
  TRIAGE_AI = "TRIAGE_AI",
  ACCREDITED_NETWORKS = "ACCREDITED_NETWORKS",
  CERTIFICATES = "CERTIFICATES",
}

/**
 * Mapping from frontend tab values to backend categories
 */
export const tabToCategoryMap: Record<string, FaqCategory> = {
  geral: FaqCategory.GENERAL,
  triagem: FaqCategory.TRIAGE_AI,
  redes: FaqCategory.ACCREDITED_NETWORKS,
  atestados: FaqCategory.CERTIFICATES,
};

/**
 * FAQ Topic DTO
 */
export interface FaqTopicDto {
  title: string;
}

/**
 * FAQ Topics Response DTO
 */
export interface FaqTopicsResponseDto {
  category: FaqCategory;
  topics: FaqTopicDto[];
}

/**
 * Ask FAQ Request DTO
 */
export interface AskFaqDto {
  message: string;
  category: FaqCategory;
}

/**
 * FAQ Response DTO
 */
export interface FaqResponseDto {
  question: string;
  category: FaqCategory;
  answer: string;
}

/**
 * Chat message for FAQ conversation
 */
export interface FaqChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

