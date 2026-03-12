export interface ImportedProviderSearchParams {
  operatorId: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  category?: string;
  specialty?: string;
  planType?: string;
  limit?: number;
  offset?: number;
}

export interface ImportedProviderResult {
  id: string;
  name: string;
  cnpj?: string;
  branchName?: string;
  networkName?: string;
  planType?: string;
  address: {
    streetType?: string;
    streetName: string;
    streetNumber?: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    postalCode: string;
    fullAddress: string;
    latitude?: number;
    longitude?: number;
  };
  phones: {
    phone1?: string;
    phone2?: string;
    whatsapp?: string;
  };
  services: Array<{
    category: string;
    specialty: string;
  }>;
}

export interface ImportedFilterOptions {
  states: string[];
  cities: string[];
  neighborhoods: string[];
  categories: string[];
  specialties: string[];
}

export const IMPORTED_NETWORK_REPOSITORY_TOKEN = Symbol(
  'IMPORTED_NETWORK_REPOSITORY_TOKEN',
);

export interface IImportedNetworkRepository {
  /**
   * Verifica se a operadora tem rede importada
   */
  hasImportedNetwork(operatorId: string): Promise<boolean>;

  /**
   * Busca prestadores na base importada
   */
  searchProviders(
    params: ImportedProviderSearchParams,
  ): Promise<ImportedProviderResult[]>;

  /**
   * Conta total de prestadores para paginação
   */
  countProviders(params: ImportedProviderSearchParams): Promise<number>;

  /**
   * Obtém opções de filtro disponíveis para uma operadora
   */
  getFilterOptions(operatorId: string): Promise<ImportedFilterOptions>;

  /**
   * Obtém estados disponíveis
   */
  getStates(operatorId: string): Promise<string[]>;

  /**
   * Obtém cidades de um estado
   */
  getCities(operatorId: string, state: string): Promise<string[]>;

  /**
   * Obtém bairros de uma cidade
   */
  getNeighborhoods(
    operatorId: string,
    state: string,
    city: string,
  ): Promise<string[]>;

  /**
   * Obtém categorias de serviço
   */
  getCategories(operatorId: string): Promise<string[]>;

  /**
   * Obtém especialidades de uma categoria
   */
  getSpecialties(operatorId: string, category?: string): Promise<string[]>;
}
