import { api } from "@/shared/services/api";
import type {
  Beneficiary,
  BeneficiariesResponse,
  BeneficiariesFilters,
  BeneficiaryResponse,
  CreateBeneficiaryRequest,
  UpdateBeneficiaryRequest,
  UpdateBeneficiaryStatusRequest,
  ImportResult,
} from "../types/beneficiary";

/**
 * URL do template de importação no S3
 * TODO: Substituir pela URL real do S3
 */
export const TEMPLATE_DOWNLOAD_URL = "/admin-rh/beneficiarios-template.xlsx";

/**
 * Remove parâmetros tenant da URL atual (se houver)
 * Beneficiários não precisam de tenant nos endpoints
 */
function cleanUrl(endpoint: string): string {
  // Se não tem query params, retorna direto
  if (!endpoint.includes("?")) {
    return endpoint;
  }

  // Remove tenant dos query params
  const [path, search] = endpoint.split("?");
  const params = new URLSearchParams(search);
  params.delete("tenant");
  params.delete("tenantName");

  const cleanSearch = params.toString();
  return cleanSearch ? `${path}?${cleanSearch}` : path;
}

/**
 * Service responsável por todas as operações relacionadas a beneficiários
 * Segue o padrão Repository para isolar a lógica de acesso à API
 */
export const beneficiaryService = {
  /**
   * Lista todos os beneficiários com filtros opcionais
   *
   * @param filters - Objeto com filtros de busca, paginação e ordenação
   * @returns Promise com a resposta paginada de beneficiários
   *
   * @example
   * ```ts
   * const response = await beneficiaryService.list({
   *   search: "João",
   *   status: "active",
   *   page: 1,
   *   pageSize: 10
   * });
   * ```
   */
  async list(filters?: BeneficiariesFilters): Promise<BeneficiariesResponse> {
    const params = new URLSearchParams();

    // Adiciona parâmetros de busca
    if (filters?.search) {
      params.append("search", filters.search);
    }

    // Filtro de status (envia como boolean)
    if (filters?.active !== undefined) {
      params.append("active", filters.active.toString());
    }

    // Paginação
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.limit) {
      params.append("limit", filters.limit.toString());
    }

    const queryString = params.toString();
    const endpoint = cleanUrl(
      `/api/users/beneficiaries${queryString ? `?${queryString}` : ""}`
    );

    return api.get<BeneficiariesResponse>(
      endpoint,
      "Erro ao carregar lista de beneficiários"
    );
  },

  /**
   * Busca um beneficiário específico por ID
   *
   * @param id - UUID do beneficiário
   * @returns Promise com os dados do beneficiário
   *
   * @throws Error se o beneficiário não for encontrado
   *
   * @example
   * ```ts
   * const beneficiary = await beneficiaryService.getById("uuid-here");
   * console.log(beneficiary.name);
   * ```
   */
  async getById(id: string): Promise<Beneficiary> {
    if (!id) {
      throw new Error("ID do beneficiário é obrigatório");
    }

    const response = await api.get<BeneficiaryResponse | Beneficiary>(
      `/api/users/beneficiaries/${id}`,
      "Erro ao carregar dados do beneficiário"
    );

    // Trata diferentes formatos de resposta
    let beneficiary: any = null;

    // Se a resposta tem a estrutura { data: Beneficiary } com id dentro
    if (response && typeof response === "object" && "data" in response && (response as any).data?.id) {
      beneficiary = (response as BeneficiaryResponse).data;
    }
    // Se a resposta é o beneficiário diretamente
    else if (response && typeof response === "object" && "id" in response) {
      beneficiary = response;
    } else {
      throw new Error("Formato de resposta inválido da API");
    }

    // Normaliza os campos da API para o formato esperado pelo frontend
    const rawType = (beneficiary as any).type;
    const rawGender = (beneficiary as any).gender;

    // Mapeia gender "Masculino"/"Feminino" para "M"/"F"
    let normalizedGender: "M" | "F" | undefined;
    if (rawGender === "M" || rawGender === "Masculino") normalizedGender = "M";
    else if (rawGender === "F" || rawGender === "Feminino") normalizedGender = "F";

    // beneficiaryType usa o enum bruto (SELF, SPOUSE, CHILD, STEPCHILD) para o form
    // type usa o valor formatado da API ("Titular", "Cônjuge", etc.) para exibição
    const validTypes = ["SELF", "SPOUSE", "CHILD", "STEPCHILD"];
    const normalizedBeneficiaryType = validTypes.includes(rawType) ? rawType : undefined;

    // Formata o type para exibição se vier como enum bruto
    const typeLabels: Record<string, string> = {
      SELF: "Titular",
      SPOUSE: "Cônjuge",
      CHILD: "Filho(a)",
      STEPCHILD: "Enteado(a)",
    };
    const displayType = typeLabels[rawType] ?? rawType;

    const normalized: Beneficiary = {
      id: beneficiary.id,
      name: beneficiary.name,
      cpf: beneficiary.cpf || "",
      email: beneficiary.email,
      active: beneficiary.isActive !== undefined ? beneficiary.isActive : (beneficiary.active !== undefined ? beneficiary.active : true),
      phone: beneficiary.phone,
      dateOfBirth: beneficiary.dateOfBirth || beneficiary.birthDate || "",
      planId: beneficiary.planId,
      tenantId: beneficiary.tenantId,
      planName: (beneficiary as any).planName || (beneficiary as any).plan?.name || undefined,
      operatorName: (beneficiary as any).operatorName || (beneficiary as any).operator?.name || undefined,
      operatorId: (beneficiary as any).operatorId || (beneficiary as any).operator?.id || undefined,
      createdAt: beneficiary.createdAt,
      updatedAt: beneficiary.updatedAt,
      type: displayType,
      gender: normalizedGender,
      memberId: (beneficiary as any).memberId || undefined,
      beneficiaryType: normalizedBeneficiaryType,
      dependents: (beneficiary as any).dependents || null,
    };

    return normalized;
  },

  /**
   * Cria um novo beneficiário no sistema
   *
   * @param data - Dados do novo beneficiário
   * @returns Promise com o beneficiário criado
   *
   * @throws Error se os dados forem inválidos ou CPF/email já existirem
   *
   * @example
   * ```ts
   * const newBeneficiary = await beneficiaryService.create({
   *   name: "João Silva",
   *   cpf: "12345678900",
   *   email: "joao@example.com"
   * });
   * ```
   */
  async create(data: CreateBeneficiaryRequest): Promise<Beneficiary> {
    // Validações básicas
    if (!data.name?.trim()) {
      throw new Error("Nome é obrigatório");
    }
    if (!data.cpf?.trim()) {
      throw new Error("CPF é obrigatório");
    }

    const response = await api.post<BeneficiaryResponse>(
      "/api/users/beneficiary",
      data,
      "Erro ao criar beneficiário"
    );

    return response.data;
  },

  /**
   * Atualiza os dados de um beneficiário existente
   *
   * @param id - UUID do beneficiário
   * @param data - Dados a serem atualizados (parcial)
   * @returns Promise com o beneficiário atualizado
   *
   * @example
   * ```ts
   * const updated = await beneficiaryService.update("uuid", {
   *   name: "João Silva Santos",
   *   email: "novo@email.com"
   * });
   * ```
   */
  async update(
    id: string,
    data: UpdateBeneficiaryRequest
  ): Promise<Beneficiary> {
    if (!id) {
      throw new Error("ID do beneficiário é obrigatório");
    }

    const response = await api.put<BeneficiaryResponse>(
      `/api/users/beneficiaries/${id}`,
      data,
      "Erro ao atualizar beneficiário"
    );

    return response.data;
  },

  /**
   * Remove um beneficiário do sistema
   *
   * @param id - UUID do beneficiário
   * @returns Promise void
   *
   * @example
   * ```ts
   * await beneficiaryService.delete("uuid");
   * ```
   */
  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error("ID do beneficiário é obrigatório");
    }

    await api.del(
      cleanUrl(`/api/users/beneficiaries/${id}`),
      "Erro ao deletar beneficiário"
    );
  },

  /**
   * Altera o status (ativo/inativo) de um beneficiário
   *
   * @param id - UUID do beneficiário
   * @param active - true para ativar, false para desativar
   * @returns Promise void
   *
   * @example
   * ```ts
   * await beneficiaryService.toggleStatus("uuid", true);
   * ```
   */
  async toggleStatus(id: string, active: boolean): Promise<void> {
    if (!id) {
      throw new Error("ID do beneficiário é obrigatório");
    }

    const payload: UpdateBeneficiaryStatusRequest = { active };

    await api.patch(
      cleanUrl(`/api/users/beneficiaries/${id}/status`),
      payload,
      "Erro ao alterar status do beneficiário"
    );
  },

  /**
   * Valida se um CPF já está cadastrado no sistema
   *
   * @param cpf - CPF a ser validado (apenas números)
   * @returns Promise com boolean indicando se o CPF existe
   *
   * @example
   * ```ts
   * const exists = await beneficiaryService.checkCpfExists("12345678900");
   * if (exists) {
   *   alert("CPF já cadastrado!");
   * }
   * ```
   */
  async checkCpfExists(cpf: string): Promise<boolean> {
    try {
      await api.get(
        cleanUrl(`/api/users/beneficiaries/check-cpf/${cpf}`),
        null
      );
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Exporta a lista de beneficiários para CSV
   *
   * @param filters - Filtros aplicados à exportação
   * @returns Promise com o arquivo blob
   *
   * @example
   * ```ts
   * const { file, fileName } = await beneficiaryService.exportToCSV({
   *   status: "active"
   * });
   * // Download do arquivo
   * const url = window.URL.createObjectURL(file);
   * const link = document.createElement('a');
   * link.href = url;
   * link.download = fileName;
   * link.click();
   * ```
   */
  async exportToCSV(filters?: BeneficiariesFilters): Promise<{
    file: Blob;
    fileName: string;
  }> {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.active !== undefined) {
      params.append("active", filters.active.toString());
    }

    const queryString = params.toString();
    const endpoint = cleanUrl(
      `/api/users/beneficiaries/export${queryString ? `?${queryString}` : ""}`
    );

    return api.get(endpoint, "Erro ao exportar beneficiários", true);
  },

  /**
   * Importa beneficiários em lote via arquivo
   *
   * @param file - Arquivo XLSX/XLS/CSV com os dados
   * @returns Promise com resumo da importação
   *
   * @example
   * ```ts
   * const result = await beneficiaryService.importFromFile(file);
   * console.log(`Importados: ${result.imported}, Erros: ${result.errors}`);
   * ```
   */
  async importFromFile(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("file", file);

    return api.post<ImportResult>(
      cleanUrl("/api/users/beneficiaries/import"),
      formData,
      "Erro ao importar beneficiários"
    );
  },
};
