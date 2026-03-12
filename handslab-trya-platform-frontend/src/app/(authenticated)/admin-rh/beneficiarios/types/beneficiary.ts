// ============================================
// Beneficiary Entities
// ============================================

/**
 * Status possíveis de um beneficiário
 */
export type BeneficiaryStatus = "active" | "inactive";

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
  /** Nome completo (obrigatório) */
  name: string;

  /** CPF (obrigatório, apenas números) */
  cpf: string;

  /** E-mail (obrigatório) */
  email: string;

  /** ID do tenant/empresa (obrigatório) */
  tenantId: string;

  /** ID do plano de saúde (obrigatório) */
  planId: string;

  /** Data de nascimento (obrigatório, formato: YYYY-MM-DD) */
  birthDate: string;

  /** Telefone com código do país (opcional, formato: +5521985632578) */
  phoneNumber?: string;

  /** Senha temporária (opcional) */
  temporaryPassword?: string;

  /** Endereço (opcional) */
  address?: BeneficiaryAddress;
}

/**
 * Payload para atualização de beneficiário
 * Todos os campos são opcionais
 */
export interface UpdateBeneficiaryRequest {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: Partial<BeneficiaryAddress>;
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
