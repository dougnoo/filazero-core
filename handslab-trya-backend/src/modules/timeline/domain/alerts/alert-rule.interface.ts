import { MedicalDocument } from '../../../../database/entities/medical-document.entity';
import { User } from '../../../../database/entities/user.entity';
import { AlertPayload, AlertContext } from './alert-types';

export interface IAlertRule {
  /**
   * Checks if this rule can generate an alert based on the given context
   */
  canGenerate(
    member: User,
    documents: MedicalDocument[],
    context?: AlertContext,
  ): Promise<boolean>;

  /**
   * Generates the alert payload if the rule applies
   */
  generateAlert(
    member: User,
    documents: MedicalDocument[],
    context?: AlertContext,
  ): Promise<AlertPayload | null>;
}

/**
 * Token for injecting all alert rules
 */
export const ALERT_RULES_TOKEN = Symbol('IAlertRule[]');

/**
 * Individual rule tokens for dependency injection
 */
export const DOCUMENT_EXPIRING_RULE_TOKEN = Symbol('DocumentExpiringRule');
export const DOCUMENT_EXPIRED_RULE_TOKEN = Symbol('DocumentExpiredRule');
export const MISSING_VACCINATION_RULE_TOKEN = Symbol('MissingVaccinationRule');
export const MISSING_EXAM_RULE_TOKEN = Symbol('MissingExamRule');
