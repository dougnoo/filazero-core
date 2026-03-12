/**
 * Interface padronizada para respostas de erro da API
 */
export interface ErrorResponse {
  /**
   * Código de status HTTP
   */
  statusCode: number;

  /**
   * Código de erro amigável para o frontend
   * Ex: "INVALID_CREDENTIALS", "NEW_PASSWORD_REQUIRED"
   */
  error: string;

  /**
   * Mensagem de erro legível para humanos
   */
  message: string | string[];

  /**
   * Timestamp ISO 8601
   */
  timestamp: string;

  /**
   * Campos extras específicos do erro
   * Ex: { session: "...", requiredAttributes: [] }
   */
  details?: Record<string, any>;

  /**
   * Array de erros de validação (quando aplicável)
   */
  validationErrors?: ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  field: string;
  constraints: string[];
}
