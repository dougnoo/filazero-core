import { User } from '../../../../database/entities/user.entity';
import { DependentType } from '../../../../shared/domain/enums/dependent-type.enum';

export interface UpdateBeneficiaryDbData {
  cognitoId?: string;
  email?: string;
  phone?: string;
}

export interface CreateBeneficiaryDbData {
  cognitoId: string | null;
  email: string | null;
  name: string;
  cpf?: string;
  tenantId?: string;
  phone?: string | null;
  birthDate: Date;
  planId?: string;
  type: string;
  gender?: string | null;
  memberId?: string | null;
  dependentType?: DependentType;
  subscriberId?: string | null;
  createdBy?: string | null;
}

export interface IBeneficiaryDbRepository {
  /**
   * Salva um beneficiário no banco de dados PostgreSQL
   * @param data - Dados do beneficiário
   * @returns Beneficiário salvo
   */
  create(data: CreateBeneficiaryDbData): Promise<User>;

  /**
   * Busca um beneficiário pelo CPF
   * @param cpf - CPF do beneficiário
   * @returns Beneficiário encontrado ou null
   */
  findByCpf(cpf: string): Promise<User | null>;

  /**
   * Busca um beneficiário pelo email
   * @param email - Email do beneficiário
   * @returns Beneficiário encontrado ou null
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Busca um beneficiário pelo ID do Cognito
   * @param cognitoId - ID do Cognito
   * @returns Beneficiário encontrado ou null
   */
  findByCognitoId(cognitoId: string): Promise<User | null>;

  /**
   * Busca um beneficiário pelo ID
   * @param id - ID do beneficiário
   * @returns Beneficiário encontrado ou null
   */
  findById(id: string): Promise<User | null>;

  /**
   * Busca um beneficiário pelo ID com dependentes
   * @param id - ID do beneficiário
   * @returns Beneficiário encontrado ou null
   */
  findByIdWithDependents(id: string): Promise<User | null>;

  /**
   * Busca um beneficiário pela matrícula
   * @param memberId - Matrícula do beneficiário
   * @param tenantId - Tenant ID para isolamento de tenant
   * @returns Beneficiário encontrado ou null
   */
  findByMemberId(memberId: string, tenantId: string): Promise<User | null>;

  /**
   * Atualiza um beneficiário no banco de dados PostgreSQL
   * @param id - ID do beneficiário
   * @param data - Dados a serem atualizados
   * @returns Beneficiário atualizado
   */
  updateDb(id: string, data: UpdateBeneficiaryDbData): Promise<void>;

  /**
   * Desativa um beneficiário no banco de dados
   * @param id - ID do beneficiário
   */
  deactivate(id: string): Promise<void>;

  /**
   * Atualiza o plano de um beneficiário
   * @param userId - ID do usuário
   * @param planId - ID do novo plano
   */
  updatePlan(userId: string, planId: string): Promise<void>;
}
