/**
 * Interface para o status de validação médica da triagem
 */
export interface TriageValidationStatus {
  /** Se há validação em andamento */
  hasValidation: boolean;
  /** Status atual: PENDING, IN_REVIEW, APPROVED, ADJUSTED */
  status?: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'ADJUSTED';
  /** Dados do médico responsável, se houver */
  assignedDoctor?: {
    name: string;
    boardCode?: string;
    boardNumber?: string;
    boardState?: string;
  };
  /** Data de criação da solicitação */
  createdAt?: string;
  /** Data de atualização da solicitação */
  updatedAt?: string;
}

/**
 * Interface do repositório de status de triagem
 */
export interface ITriageStatusRepository {
  /**
   * Busca o status de validação médica mais recente do usuário
   * @param userId - ID do usuário
   * @param tenantId - ID do tenant
   */
  getLatestValidationStatus(
    userId: string,
    tenantId: string,
  ): Promise<TriageValidationStatus>;
}

export const TRIAGE_STATUS_REPOSITORY_TOKEN = 'ITriageStatusRepository';
