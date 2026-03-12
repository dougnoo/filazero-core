import type { MedicalApprovalRequestStatus, UrgencyLevel } from "../types";

/**
 * Mapeamento de status para exibição
 */
export const STATUS_DISPLAY_MAP: Record<MedicalApprovalRequestStatus, string> = {
  PENDING: "Pendente",
  IN_REVIEW: "Em análise",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  ADJUSTED: "Ajustado",
};

/**
 * Mapeamento de urgência para exibição
 */
export const URGENCY_DISPLAY_MAP: Record<UrgencyLevel, string> = {
  EMERGENCY: "Emergência",
  VERY_URGENT: "Muito urgente",
  URGENT: "Urgente",
  STANDARD: "Padrão",
  NON_URGENT: "Não urgente",
};

/**
 * Mapeamento de cores para chips de status
 * Compatível com StatusChip (bgColor) e Chip MUI (bgcolor)
 */
export const STATUS_COLOR_MAP: Record<MedicalApprovalRequestStatus, { bgcolor: string; color: string; bgColor: string }> = {
  PENDING: { bgcolor: "#FEF3C7", color: "#F59E0B", bgColor: "#FEF3C7" },
  IN_REVIEW: { bgcolor: "#DBEAFE", color: "#3B82F6", bgColor: "#DBEAFE" },
  APPROVED: { bgcolor: "#D1FAE5", color: "#10B981", bgColor: "#D1FAE5" },
  REJECTED: { bgcolor: "#FEE2E2", color: "#DC2626", bgColor: "#FEE2E2" },
  ADJUSTED: { bgcolor: "#EDE9FE", color: "#8B5CF6", bgColor: "#EDE9FE" },
};

/**
 * Mapeamento de cores para chips de urgência
 */
export const URGENCY_COLOR_MAP: Record<UrgencyLevel, { bgcolor: string; color: string }> = {
  EMERGENCY: { bgcolor: "#FEE2E2", color: "#DC2626" },
  VERY_URGENT: { bgcolor: "#FED7AA", color: "#EA580C" },
  URGENT: { bgcolor: "#FEF3C7", color: "#D97706" },
  STANDARD: { bgcolor: "#DBEAFE", color: "#3B82F6" },
  NON_URGENT: { bgcolor: "#D1FAE5", color: "#059669" },
};

/**
 * Opções de status para filtros e selects
 */
export const STATUS_OPTIONS = [
  { value: "PENDING" as const, label: STATUS_DISPLAY_MAP.PENDING },
  { value: "IN_REVIEW" as const, label: STATUS_DISPLAY_MAP.IN_REVIEW },
  { value: "APPROVED" as const, label: STATUS_DISPLAY_MAP.APPROVED },
  { value: "REJECTED" as const, label: STATUS_DISPLAY_MAP.REJECTED },
  { value: "ADJUSTED" as const, label: STATUS_DISPLAY_MAP.ADJUSTED },
];

/**
 * Opções de urgência para filtros e selects
 */
export const URGENCY_OPTIONS = [
  { value: "EMERGENCY" as const, label: URGENCY_DISPLAY_MAP.EMERGENCY },
  { value: "VERY_URGENT" as const, label: URGENCY_DISPLAY_MAP.VERY_URGENT },
  { value: "URGENT" as const, label: URGENCY_DISPLAY_MAP.URGENT },
  { value: "STANDARD" as const, label: URGENCY_DISPLAY_MAP.STANDARD },
  { value: "NON_URGENT" as const, label: URGENCY_DISPLAY_MAP.NON_URGENT },
];