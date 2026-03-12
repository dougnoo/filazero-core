// ============================================
// Beneficiary Entities
// ============================================

/**
 * Status possíveis de um beneficiário
 */
export type BeneficiaryStatus = "active" | "inactive";

/**
 * Tipo de vínculo do beneficiário (espelha DependentType do backend)
 */
export type BeneficiaryType = "SELF" | "SPOUSE" | "CHILD" | "STEPCHILD";

/**
 * Gênero do beneficiário (espelha Gender do backend)
 */
export type BeneficiaryGender = "M" | "F";

/**
 * Entidade principal de Beneficiário
 * Representa um beneficiário no sistema
 */
export interface Beneficiary {
  /** ID único do beneficiário (UUID) */
  id: string;

  /** Nome completo do beneficiário */
  name: string;

  /** CPF formatado (xxx.xxx.xxx-xx) */
  cpf: string;

  /** E-mail do beneficiário */
  email: string;

  /** Status atual do beneficiário */
  active: boolean;

  /** Data de criação (ISO 8601) */
  createdAt?: string;

  /** Data da última atualização (ISO 8601) */
  updatedAt?: string;

  /** Tipo de vínculo do beneficiário */
  beneficiaryType?: BeneficiaryType;

  /** Gênero do beneficiário */
  gender?: BeneficiaryGender;

  /** Matrícula do beneficiário */
  memberId?: string;

  /** Tipo formatado retornado pela API (ex: "Titular", "Cônjuge de João") */
  type?: string;

  /** Dependentes vinculados (apenas para titulares) */
  dependents?: BeneficiaryDependent[] | null;

  /** Dados adicionais opcionais */
  phone?: string;
  dateOfBirth?: string;
  address?: BeneficiaryAddress;
  planId?: string;
  tenantId?: string;
  planName?: string;
  operatorName?: string;
  operatorId?: string;
}

/**
 * Dependente vinculado a um beneficiário titular
 */
export interface BeneficiaryDependent {
  id: string;
  name: string;
  cpf: string | null;
  birthDate: string | Date;
  email: string | null;
  phone: string | null;
  gender: string | null;
  isActive: boolean;
  memberId: string | null;
  type: string;
}

/**
 * Endereço do beneficiário
 */
export interface BeneficiaryAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// ============================================
// API Response Types
// ============================================

/**
 * Resposta paginada da API de beneficiários
 */
export interface BeneficiariesResponse {
  /** Lista de beneficiários */
  data: Beneficiary[];

  /** Total de registros no banco */
  total: number;

  /** Página atual */
  page: number;

  /** Quantidade de itens por página */
  limit: number;

  /** Total de páginas */
  totalPages: number;
}

/**
 * Resposta única da API (para GET /beneficiaries/:id)
 */
export interface BeneficiaryResponse {
  data: Beneficiary;
}

/**
 * Resposta de erro da API
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ============================================
// Request Types
// ============================================

/**
 * Filtros para listagem de beneficiários
 */
export interface BeneficiariesFilters {
  /** Busca por nome, CPF ou e-mail */
  search?: string;

  /** Filtrar por status (active = true, inactive = false) */
  active?: boolean;

  /** Número da página (default: 1) */
  page?: number;

  /** Quantidade de itens por página (default: 10) */
  limit?: number;
}

/**
 * Payload para criação de beneficiário
 */
export interface CreateBeneficiaryRequest {
  name: string;
  cpf: string;
  birthDate: string;
  tenantId: string;
  planId: string;
  gender: BeneficiaryGender;
  memberId: string;
  beneficiaryType: BeneficiaryType;
}

/**
 * Payload para atualização de beneficiário
 */
export interface UpdateBeneficiaryRequest {
  name?: string;
  email?: string;
  birthDate?: string;
  gender?: BeneficiaryGender;
  memberId?: string;
  dependentType?: BeneficiaryType;
}

/**
 * Payload para alteração de status
 */
export interface UpdateBeneficiaryStatusRequest {
  active: boolean;
}

// ============================================
// Validation Types
// ============================================

/**
 * Erros de validação de campos
 */
export interface BeneficiaryValidationErrors {
  name?: string[];
  cpf?: string[];
  email?: string[];
  phone?: string[];
  dateOfBirth?: string[];
}

// ============================================
// Utility Types
// ============================================

/**
 * Tipo para beneficiário com status computado
 */
export type BeneficiaryWithStatus = Beneficiary & {
  statusLabel: "Ativo" | "Inativo";
  statusColor: "success" | "default";
};

/**
 * Tipo parcial para formulários
 */
export type BeneficiaryFormData = Partial<Beneficiary>;

/**
 * Tipo para seleção de beneficiário (usado em dropdowns)
 */
export interface BeneficiarySelectOption {
  id: string;
  label: string;
  cpf: string;
}

// ============================================
// Import Types
// ============================================

/**
 * Resultado da importação em lote
 */
export interface ImportResult {
  /** Total de linhas processadas */
  totalRows: number;

  /** Quantidade de beneficiários importados com sucesso */
  successCount: number;

  /** Quantidade de erros encontrados */
  errorCount: number;

  /** Lista de erros detalhados */
  errors: ImportError[];

  /** IDs dos usuários criados */
  createdUserIds: string[];
}

/**
 * Erro individual de importação
 */
export interface ImportError {
  /** Linha do arquivo onde ocorreu o erro */
  row: number;

  /** Dados da linha que causou o erro */
  data: Record<string, any>;

  /** Mensagem de erro */
  error: string;
}
