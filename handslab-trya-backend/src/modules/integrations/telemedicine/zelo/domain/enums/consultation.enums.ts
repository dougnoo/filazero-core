/**
 * Tipo de consulta/atendimento
 */
export enum ConsultationType {
  POOL = 'POOL',
  SCHEDULED = 'SCHEDULED',
}

/**
 * Status da consulta/atendimento
 */
export enum ConsultationStatus {
  SCHEDULED = 'SCHEDULED',
  PENDING = 'PENDING',
  WAITING_HELPDESK = 'WAITING_HELPDESK',
  ONGOING_HELPDESK = 'ONGOING_HELPDESK',
  WAITING_DOCTOR = 'WAITING_DOCTOR',
  ONGOING_DOCTOR = 'ONGOING_DOCTOR',
  FINISHED = 'FINISHED',
  CANCELED = 'CANCELED',
}
