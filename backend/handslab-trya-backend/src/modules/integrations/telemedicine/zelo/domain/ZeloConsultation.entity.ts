export enum ConsultationType {
  POOL = 'POOL',
  SCHEDULED = 'SCHEDULED',
}

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

export interface ZeloConsultationPatient {
  name: string;
  cpf: string;
}

export interface ZeloConsultationDoctor {
  name: string;
  cpf: string;
  crm: string;
}

export interface ZeloConsultationSpeciality {
  name: string;
}

export interface ZeloConsultationHelpdeskAgent {
  name: string;
  cpf: string;
}

/**
 * Entidade de domínio representando uma consulta/atendimento Zelo
 */
export class ZeloConsultation {
  code: string;
  type: ConsultationType;
  meetingStatus: ConsultationStatus;
  requestedAt: string;
  scheduledFor?: string;
  startAt?: string;
  endAt?: string;
  durationTotalSeconds?: number;
  durationFormatted?: string;
  price?: number;
  isPaid?: boolean;
  paidAt?: string;
  chiefComplaint?: string;
  doctorNotes?: string;
  patient: ZeloConsultationPatient;
  doctor?: ZeloConsultationDoctor;
  speciality?: ZeloConsultationSpeciality;
  helpdeskAgent?: ZeloConsultationHelpdeskAgent;

  constructor(data: Partial<ZeloConsultation>) {
    Object.assign(this, data);
  }

  /**
   * Valida se a consulta tem os campos obrigatórios
   */
  validate(): boolean {
    if (!this.code) {
      throw new Error('Código da consulta é obrigatório');
    }

    if (!this.type) {
      throw new Error('Tipo da consulta é obrigatório');
    }

    if (!this.meetingStatus) {
      throw new Error('Status da consulta é obrigatório');
    }

    if (!this.patient || !this.patient.cpf) {
      throw new Error('CPF do paciente é obrigatório');
    }

    return true;
  }

  /**
   * Verifica se a consulta está finalizada
   */
  isFinished(): boolean {
    return this.meetingStatus === ConsultationStatus.FINISHED;
  }

  /**
   * Verifica se a consulta está cancelada
   */
  isCanceled(): boolean {
    return this.meetingStatus === ConsultationStatus.CANCELED;
  }

  /**
   * Verifica se a consulta está em andamento
   */
  isOngoing(): boolean {
    return (
      this.meetingStatus === ConsultationStatus.ONGOING_DOCTOR ||
      this.meetingStatus === ConsultationStatus.ONGOING_HELPDESK
    );
  }
}
