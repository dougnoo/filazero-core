import { ZeloPatient } from '../ZeloPatient.entity';
import { ZeloConsultation } from '../ZeloConsultation.entity';
import {
  ZeloAttachment,
  AttachmentFileType,
  AttachmentOrigin,
} from '../ZeloAttachment.entity';
import {
  ConsultationStatus,
  ConsultationType,
} from '../enums/consultation.enums';

export interface ZeloAttachmentFilters {
  // Obrigatório
  cpf: string;

  // Filtros opcionais
  consultation_code?: string;
  file_type?: AttachmentFileType;
  origin?: AttachmentOrigin;

  // Datas de criação
  created_at_min?: string; // YYYY-MM-DD
  created_at_max?: string; // YYYY-MM-DD

  // Paginação
  page?: number;
  page_size?: number;
}

export interface ZeloConsultationFilters {
  // Obrigatório
  cpf: string;

  // Status e tipo
  status?: ConsultationStatus;
  type?: ConsultationType;

  // Médico e especialidade
  doctor_cpf?: string;
  speciality_name?: string;

  // Datas - Data de início
  start_date_min?: string; // YYYY-MM-DD
  start_date_max?: string; // YYYY-MM-DD

  // Datas - Data de fim
  end_date_min?: string; // YYYY-MM-DD
  end_date_max?: string; // YYYY-MM-DD

  // Datas - Agendamento
  scheduled_for_min?: string; // YYYY-MM-DD
  scheduled_for_max?: string; // YYYY-MM-DD

  // Pagamento
  is_paid?: boolean;

  // Paginação
  page?: number;
  page_size?: number;
}

export interface ZeloPatientFilters {
  // Dados pessoais
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;

  // Status
  status?: 'ACTIVE' | 'INACTIVE';
  is_online?: boolean;

  // Datas - Data de nascimento
  birth_date_min?: string;
  birth_date_max?: string;

  // Datas - Adesão do plano
  plan_adherence_date_min?: string;
  plan_adherence_date_max?: string;

  // Datas - Expiração do plano
  plan_expiry_date_min?: string;
  plan_expiry_date_max?: string;

  // Datas - Convite
  invited_at_min?: string;
  invited_at_max?: string;

  // Titular/Dependente
  holder_id?: number;
  is_holder?: boolean;

  // Endereço
  address__street?: string;
  address__city?: string;
  address__state?: string;
  address__zip_code?: string;

  // Plano
  insurance_card_number?: string;
  insurance_plan_code?: string;

  // Paginação
  page?: number;
  page_size?: number;

  // Campos dinâmicos (extra_fields)
  [key: string]: any;
}

export interface ZeloPagination {
  page: number;
  page_size: number;
}

export interface ZeloPaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ZeloMagicLink {
  magic_link: string;
  expires_at: string;
  message: string;
}

/**
 * Repository interface para integração com API Zelo Saúde
 */
export interface IZeloRepository {
  /**
   * Cria um novo paciente na Zelo
   */
  createPatient(patient: ZeloPatient): Promise<ZeloPatient>;

  /**
   * Gera magic link de login para um paciente
   */
  generateMagicLink(cpf: string): Promise<ZeloMagicLink>;

  /**
   * Filtra pacientes com base em critérios
   */
  filterPatients(
    filters: ZeloPatientFilters,
    pagination: ZeloPagination,
  ): Promise<ZeloPaginatedResult<ZeloPatient>>;

  /**
   * Busca histórico de consultas/atendimentos de um paciente
   */
  getConsultationHistory(
    filters: ZeloConsultationFilters,
  ): Promise<ZeloPaginatedResult<ZeloConsultation>>;

  /**
   * Busca histórico de anexos (receitas, atestados, exames) de um paciente
   */
  getAttachmentHistory(
    filters: ZeloAttachmentFilters,
  ): Promise<ZeloPaginatedResult<ZeloAttachment>>;

  /**
   * Busca histórico de atendimentos de um paciente (deprecated - use getConsultationHistory)
   */
  getPatientHistory(cpf: string): Promise<any>;

  /**
   * Busca histórico de anexos de um paciente (deprecated - use getAttachmentHistory)
   */
  getPatientAttachments(cpf: string): Promise<any>;
}
