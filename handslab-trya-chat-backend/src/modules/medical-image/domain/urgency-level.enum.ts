/**
 * Enum representing medical urgency levels for triage
 */
export enum UrgencyLevel {
  LOW = 'LOW',           // Can wait for routine appointment or home care
  MEDIUM = 'MEDIUM',     // Should seek medical attention within 24-48h
  HIGH = 'HIGH',         // Requires medical attention same day
  CRITICAL = 'CRITICAL', // Emergency - go to ER immediately
}

/**
 * Helper function to validate urgency level
 */
export function isValidUrgencyLevel(level: string): level is UrgencyLevel {
  return Object.values(UrgencyLevel).includes(level as UrgencyLevel);
}

/**
 * Helper function to convert string to UrgencyLevel with fallback
 */
export function toUrgencyLevel(level: string): UrgencyLevel {
  if (isValidUrgencyLevel(level)) {
    return level as UrgencyLevel;
  }
  return UrgencyLevel.LOW;
}
