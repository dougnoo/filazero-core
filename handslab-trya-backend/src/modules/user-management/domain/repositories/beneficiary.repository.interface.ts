/**
 * Interface do Repository de Beneficiários (Domain Layer)
 *
 * Esta interface define o contrato para acesso aos dados de beneficiários.
 * A implementação concreta ficará na camada de Infrastructure.
 */

import { Gender } from 'src/shared/domain/enums/gender.enum';
import { DependentType } from '../../../../shared/domain/enums/dependent-type.enum';

export interface ListBeneficiariesFilters {
  tenantId?: string;
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedBeneficiaries {
  data: BeneficiaryModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BeneficiaryModel {
  id: string;
  name: string;
  cpf: string | null;
  email: string | null;
  cognitoId: string | null;
  deletedAt: Date | null;
  dependentType: string | null;
  subscriberName?: string;
}

export interface UpdateBeneficiaryData {
  name?: string;
  cpf?: string;
  birthDate?: Date;
  email?: string;
  phone?: string;
  tenantId?: string;
  planId?: string;
  gender?: Gender;
  memberId?: string;
  dependentType?: DependentType;
}

export interface BeneficiaryDependentModel {
  id: string;
  name: string;
  cpf: string | null;
  birthDate: Date;
  email: string | null;
  phone: string | null;
  deletedAt: Date | null;
  gender: string | null;
  memberId: string | null;
  dependentType: string;
}

export interface BeneficiaryDetailModel {
  id: string;
  name: string;
  cpf: string | null;
  birthDate: Date;
  email: string | null;
  phone: string | null;
  tenantId: string | null;
  tenantName: string | null;
  cognitoId: string | null;
  planId: string | null;
  planName: string | null;
  operatorName: string | null;
  updatedAt: Date;
  deletedAt: Date | null;
  gender: string | null;
  memberId: string | null;
  dependentType: string | null;
  dependents?: BeneficiaryDependentModel[] | null;
}

export abstract class IBeneficiaryRepository {
  /**
   * Lista beneficiários com filtros opcionais
   * @param filters - Filtros de busca
   * @returns Lista paginada de beneficiários
   */
  abstract listBeneficiaries(
    filters: ListBeneficiariesFilters,
  ): Promise<PaginatedBeneficiaries>;

  /**
   * Busca um beneficiário por ID
   * @param id - ID do beneficiário
   * @returns Beneficiário encontrado ou null
   */
  abstract findBeneficiaryById(
    id: string,
  ): Promise<BeneficiaryDetailModel | null>;

  /**
   * Atualiza dados de um beneficiário
   * @param id - ID do beneficiário
   * @param data - Dados a serem atualizados
   * @returns Beneficiário atualizado
   */
  abstract updateBeneficiary(
    id: string,
    data: UpdateBeneficiaryData,
  ): Promise<BeneficiaryDetailModel>;
}
