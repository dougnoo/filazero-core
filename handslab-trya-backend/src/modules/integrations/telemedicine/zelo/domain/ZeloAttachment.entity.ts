export enum AttachmentFileType {
  PATIENT_CERTIFICATE = 'PATIENT_CERTIFICATE',
  COMPANION_CERTIFICATE = 'COMPANION_CERTIFICATE',
  PRESCRIPTION = 'PRESCRIPTION',
  EXAM = 'EXAM',
  FORWARDING = 'FORWARDING',
  PATIENT_UPLOAD = 'PATIENT_UPLOAD',
}

export enum AttachmentOrigin {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  HELPDESK = 'HELPDESK',
}

export interface ZeloAttachmentConsultationPatient {
  name: string;
  cpf: string;
}

export interface ZeloAttachmentConsultationDoctor {
  name: string;
  cpf: string;
  crm: string;
}

export interface ZeloAttachmentConsultationSpeciality {
  name: string;
}

export interface ZeloAttachmentConsultation {
  code: string;
  type: string;
  meetingStatus: string;
  scheduledFor?: string;
  startAt?: string;
  endAt?: string;
  patient?: ZeloAttachmentConsultationPatient;
  doctor?: ZeloAttachmentConsultationDoctor;
  speciality?: ZeloAttachmentConsultationSpeciality;
}

/**
 * Entidade de domínio representando um anexo (receita, atestado, exame, etc)
 */
export class ZeloAttachment {
  fileType: AttachmentFileType;
  origin: AttachmentOrigin;
  fileName: string;
  fileUrl: string;
  fileIcon?: string;
  createdAt: string;
  consultation?: ZeloAttachmentConsultation;

  constructor(data: Partial<ZeloAttachment>) {
    Object.assign(this, data);
  }

  /**
   * Valida se o anexo tem os campos obrigatórios
   */
  validate(): boolean {
    if (!this.fileType) {
      throw new Error('Tipo do arquivo é obrigatório');
    }

    if (!this.origin) {
      throw new Error('Origem do anexo é obrigatória');
    }

    if (!this.fileName) {
      throw new Error('Nome do arquivo é obrigatório');
    }

    if (!this.fileUrl) {
      throw new Error('URL do arquivo é obrigatória');
    }

    if (!this.createdAt) {
      throw new Error('Data de criação é obrigatória');
    }

    return true;
  }

  /**
   * Verifica se o anexo é uma receita médica
   */
  isPrescription(): boolean {
    return this.fileType === AttachmentFileType.PRESCRIPTION;
  }

  /**
   * Verifica se o anexo é um atestado
   */
  isCertificate(): boolean {
    return (
      this.fileType === AttachmentFileType.PATIENT_CERTIFICATE ||
      this.fileType === AttachmentFileType.COMPANION_CERTIFICATE
    );
  }

  /**
   * Verifica se o anexo é um exame
   */
  isExam(): boolean {
    return this.fileType === AttachmentFileType.EXAM;
  }

  /**
   * Verifica se o anexo foi criado pelo médico
   */
  isFromDoctor(): boolean {
    return this.origin === AttachmentOrigin.DOCTOR;
  }

  /**
   * Verifica se o anexo foi enviado pelo paciente
   */
  isFromPatient(): boolean {
    return this.origin === AttachmentOrigin.PATIENT;
  }
}
