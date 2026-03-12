import { User } from '../entities/user.entity';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

export interface CreateUserData {
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string;
  temporaryPassword?: string;
  phoneNumber?: string;
  cpf: string;
}

export interface UpdateUserData {
  name?: string;
  role?: UserRole;
  isEmailVerified?: boolean;
  userId?: string;
  picture?: string; // URL da foto de perfil
}

export interface ListUsersFilters {
  tenantId?: string;
  role?: UserRole;
  limit?: number;
  nextToken?: string;
}

export interface ListUsersResult {
  users: User[];
  nextToken?: string;
}

export interface IUserRepository {
  /**
   * Cria um novo usuário no Cognito
   * @param userData - Dados do usuário a ser criado
   * @returns Usuário criado
   */
  createUser(userData: CreateUserData): Promise<User>;

  /**
   * Lista usuários com filtros opcionais
   * @param filters - Filtros para a listagem
   * @returns Lista de usuários e token para paginação
   */
  listUsers(filters: ListUsersFilters): Promise<ListUsersResult>;

  /**
   * Busca um usuário pelo email
   * @param email - Email do usuário
   * @returns Usuário encontrado ou null
   */
  getUserByEmail(email: string): Promise<User | null>;

  /**
   * Atualiza dados de um usuário
   * @param email - Email do usuário
   * @param userData - Dados a serem atualizados
   * @returns Usuário atualizado
   */
  updateUser(email: string, userData: UpdateUserData): Promise<User>;

  /**
   * Remove um usuário
   * @param email - Email do usuário
   */
  deleteUser(email: string): Promise<void>;

  /**
   * Verifica se um usuário existe
   * @param email - Email do usuário
   * @returns True se existe, false caso contrário
   */
  userExists(email: string): Promise<boolean>;

  /**
   * Atribui um grupo/role a um usuário
   * @param username - username do usuário
   * @param role - Role a ser atribuída
   */
  assignRole(username: string, role: UserRole): Promise<void>;

  /**
   * Remove um grupo/role de um usuário
   * @param email - Email do usuário
   * @param role - Role a ser removida
   */
  removeRole(email: string, role: UserRole): Promise<void>;

  /**
   * Desativa um usuário no Cognito
   * @param email - Email do usuário
   */
  disableUser(email: string): Promise<void>;

  /**
   * Atualiza custom attribute do usuário no Cognito
   * @param email - Email do usuário
   * @param attributeName - Nome do atributo (ex: 'userId')
   * @param attributeValue - Valor do atributo
   */
  updateCustomAttribute(
    email: string,
    attributeName: string,
    attributeValue: string,
  ): Promise<void>;

  /**
   * Define a senha do usuário como permanente (status CONFIRMED)
   * Isso evita que o usuário precise trocar a senha no primeiro login
   * @param username - Username do usuário (CPF)
   * @param password - Senha a ser definida
   */
  setPasswordPermanent(username: string, password: string): Promise<void>;
}
