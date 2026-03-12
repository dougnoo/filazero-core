/**
 * Constantes relacionadas a beneficiários
 * Centralize aqui valores fixos para facilitar manutenção
 */

/**
 * Opções de status para filtros
 */
export const BENEFICIARY_STATUS_OPTIONS = [
  { value: "all", label: "Todos os status" },
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
] as const;

/**
 * Opções de itens por página
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/**
 * Página padrão inicial
 */
export const DEFAULT_PAGE = 1;

/**
 * Tamanho padrão de página
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Opções de ordenação
 */
export const SORT_OPTIONS = [
  { value: "name", label: "Nome (A-Z)" },
  { value: "-name", label: "Nome (Z-A)" },
  { value: "createdAt", label: "Mais antigos" },
  { value: "-createdAt", label: "Mais recentes" },
  { value: "email", label: "E-mail (A-Z)" },
] as const;

/**
 * Mensagens de feedback para o usuário
 */
export const BENEFICIARY_MESSAGES = {
  SUCCESS: {
    CREATE: "Beneficiário criado com sucesso!",
    UPDATE: "Beneficiário atualizado com sucesso!",
    DELETE: "Beneficiário removido com sucesso!",
    ACTIVATE: "Beneficiário ativado com sucesso!",
    DEACTIVATE: "Beneficiário desativado com sucesso!",
    EXPORT: "Dados exportados com sucesso!",
    IMPORT: "Importação realizada com sucesso!",
  },
  ERROR: {
    LOAD: "Erro ao carregar beneficiários",
    LOAD_ONE: "Erro ao carregar dados do beneficiário",
    CREATE: "Erro ao criar beneficiário",
    UPDATE: "Erro ao atualizar beneficiário",
    DELETE: "Erro ao remover beneficiário",
    TOGGLE_STATUS: "Erro ao alterar status",
    EXPORT: "Erro ao exportar dados",
    IMPORT: "Erro ao importar dados",
    CPF_EXISTS: "CPF já cadastrado no sistema",
    EMAIL_EXISTS: "E-mail já cadastrado no sistema",
    NETWORK: "Erro de conexão. Verifique sua internet.",
  },
  CONFIRM: {
    DELETE: "Tem certeza que deseja remover este beneficiário?",
    DEACTIVATE: "Desativar este beneficiário?",
    ACTIVATE: "Ativar este beneficiário?",
  },
  VALIDATION: {
    NAME_REQUIRED: "Nome é obrigatório",
    CPF_REQUIRED: "CPF é obrigatório",
    CPF_INVALID: "CPF inválido",
    EMAIL_REQUIRED: "E-mail é obrigatório",
    EMAIL_INVALID: "E-mail inválido",
    PHONE_INVALID: "Telefone inválido",
    DATE_INVALID: "Data inválida",
  },
} as const;

/**
 * Regex para validações
 */
export const VALIDATION_PATTERNS = {
  // CPF: apenas números, 11 dígitos
  CPF: /^\d{11}$/,
  // CPF formatado: xxx.xxx.xxx-xx
  CPF_FORMATTED: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  // Email básico
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Telefone: (xx) xxxxx-xxxx ou (xx) xxxx-xxxx
  PHONE: /^\(\d{2}\)\s?\d{4,5}-\d{4}$/,
  // Data: YYYY-MM-DD
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
} as const;

/**
 * Limites de caracteres
 */
export const FIELD_LIMITS = {
  NAME: { min: 3, max: 100 },
  EMAIL: { min: 5, max: 100 },
  PHONE: { min: 10, max: 15 },
  SEARCH: { max: 100 },
} as const;

/**
 * Colunas da tabela (para exportação e configuração)
 */
export const TABLE_COLUMNS = [
  { key: "name", label: "Nome", sortable: true },
  { key: "cpf", label: "CPF", sortable: false },
  { key: "email", label: "E-mail", sortable: true },
  { key: "phone", label: "Telefone", sortable: false },
  { key: "active", label: "Status", sortable: true },
  { key: "createdAt", label: "Data de Cadastro", sortable: true },
] as const;

/**
 * Configurações de debounce
 */
export const DEBOUNCE_DELAYS = {
  SEARCH: 500, // ms para busca
  AUTO_SAVE: 1000, // ms para auto-save
} as const;

/**
 * URLs de redirecionamento
 */
export const BENEFICIARY_ROUTES = {
  LIST: "/admin-rh/beneficiarios",
  CREATE: "/admin-rh/beneficiarios/novo",
  EDIT: (id: string) => `/admin-rh/beneficiarios/${id}/editar`,
  VIEW: (id: string) => `/admin-rh/beneficiarios/${id}`,
} as const;

