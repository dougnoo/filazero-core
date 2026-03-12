import { TriageSession } from '../entities/triage-session.entity';

export const TRIAGE_HISTORY_REPOSITORY_TOKEN = 'TRIAGE_HISTORY_REPOSITORY';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ITriageHistoryRepository {
  /**
   * Busca histórico de triagens do usuário (Redis + DynamoDB)
   * Retorna sessões ativas e finalizadas ordenadas por data
   */
  getHistory(
    userId: string,
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<TriageSession>>;

  /**
   * Busca sessão específica por ID (DynamoDB primeiro, depois Redis)
   * Usado quando usuário clica em item do histórico
   * Busca DynamoDB primeiro (mais provável - sessões finalizadas)
   * Depois Redis (menos provável - sessões em andamento)
   */
  getSession(
    sessionId: string,
    userId: string,
    tenantId: string,
  ): Promise<TriageSession | null>;

  /**
   * Busca sessão ativa do usuário (apenas Redis)
   * Usado para continuar triagem em andamento automaticamente
   * Retorna apenas sessões com status DRAFT e is_complete=false
   */
  getActiveSession(
    userId: string,
    tenantId: string,
  ): Promise<TriageSession | null>;
}
