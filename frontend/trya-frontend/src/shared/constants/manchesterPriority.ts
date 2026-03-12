/**
 * Manchester Triage System Priority Colors
 */

export interface PriorityColorConfig {
  bgcolor: string;
  color: string;
}

/**
 * Manchester priority colors
 */
export const MANCHESTER_PRIORITY_COLORS: Record<string, PriorityColorConfig> = {
  EMERGENCY: { bgcolor: "#FEE2E2", color: "#DC2626" },
  VERY_URGENT: { bgcolor: "#FED7AA", color: "#EA580C" },
  URGENT: { bgcolor: "#FEF3C7", color: "#D97706" },
  STANDARD: { bgcolor: "#D1FAE5", color: "#059669" },
  NON_URGENT: { bgcolor: "#DBEAFE", color: "#3B82F6" },
};

/**
 * Manchester priority display labels (Portuguese)
 */
export const MANCHESTER_PRIORITY_LABELS: Record<string, string> = {
  EMERGENCY: "Emergência",
  VERY_URGENT: "Muito urgente",
  URGENT: "Urgente",
  STANDARD: "Padrão",
  NON_URGENT: "Não urgente",
};

const DEFAULT_PRIORITY_COLOR: PriorityColorConfig = {
  bgcolor: "#F3F4F6",
  color: "#6B7280",
};

/**
 * Get priority color by priority string
 */
export function getPriorityColor(priority: string): PriorityColorConfig {
  const normalized = priority.toUpperCase().trim().replace(/[_\s]+/g, "_");
  return MANCHESTER_PRIORITY_COLORS[normalized] ?? DEFAULT_PRIORITY_COLOR;
}

/**
 * Get priority label in Portuguese
 */
export function getPriorityLabel(priority: string): string {
  const normalized = priority.toUpperCase().trim().replace(/[_\s]+/g, "_");
  return MANCHESTER_PRIORITY_LABELS[normalized] ?? priority;
}
