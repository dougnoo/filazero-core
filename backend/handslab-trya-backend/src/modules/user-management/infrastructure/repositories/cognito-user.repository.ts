import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
  ListUsersFilters,
  ListUsersResult,
} from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { UserNotFoundError } from '../../../../shared/domain/errors/user-not-found.error';
import { UserMapper } from '../mappers/user.mapper';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  ListUsersCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  AdminDisableUserCommand,
  AdminSetUserPasswordCommand,
  UserNotFoundException,
  UsernameExistsException,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserCreationError } from '../../domain/errors/user-creation.error';
import { UserUpdateError } from '../../domain/errors/user-update.error';
import { UserDeletionError } from '../../domain/errors/user-deletion.error';
import { RoleAssignmentError } from '../../domain/errors/role-assignment.error';
import { UserAlreadyExistsError } from 'src/shared/domain/errors/user-already-exists.error';

@Injectable()
export class CognitoUserRepository implements IUserRepository {
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private readonly userPoolId: string;

  constructor(private readonly configService: ConfigService) {
    // Obter credenciais opcionais da configuração
    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    this.cognitoClient = new CognitoIdentityProviderClient({
      region:
        this.configService.get<string>('aws.cognito.region') || 'us-east-1',
      // Passar o profile se estiver configurado (necessário para AWS SSO)
      ...(profile ? { profile } : {}),
      // Só passar credenciais explicitamente se ambas estiverem configuradas
      // Caso contrário, o SDK detectará automaticamente (SSO, env vars, IAM role, etc)
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          }
        : {}),
    });
    this.userPoolId =
      this.configService.get<string>('aws.cognito.userPoolId') || '';
  }

  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const username = userData.cpf;
      const command = new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
        UserAttributes: [
          { Name: 'email', Value: userData.email },
          { Name: 'name', Value: userData.name },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'custom:tenant_id', Value: userData.tenantId },
          ...(userData.phoneNumber
            ? [
                { Name: 'phone_number', Value: userData.phoneNumber },
                { Name: 'phone_number_verified', Value: 'true' },
              ]
            : []),
        ],
        TemporaryPassword: userData.temporaryPassword,
        MessageAction: 'SUPPRESS', // Não enviar email de boas-vindas
      });

      const response = await this.cognitoClient.send(command);

      return User.create(
        response.User?.Attributes?.find((attr) => attr.Name === 'sub')?.Value ||
          '',
        username,
        userData.email,
        userData.name,
        userData.role,
        true,
        userData.tenantId,
      );
    } catch (error) {
      if (error instanceof UsernameExistsException) {
        throw new UserAlreadyExistsError();
      }
      throw new UserCreationError(
        `Erro ao criar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  async listUsers(filters: ListUsersFilters): Promise<ListUsersResult> {
    try {
      const command = new ListUsersCommand({
        UserPoolId: this.userPoolId,
        Limit: filters.limit || 20,
        PaginationToken: filters.nextToken,
        Filter: this.buildFilter(filters),
      });

      const response = await this.cognitoClient.send(command);

      const users = (response.Users || []).map((user) =>
        UserMapper.toDomain({
          id: user.Username,
          email: user.Attributes?.find((attr) => attr.Name === 'email')?.Value,
          name: user.Attributes?.find((attr) => attr.Name === 'name')?.Value,
          email_verified:
            user.Attributes?.find((attr) => attr.Name === 'email_verified')
              ?.Value === 'true',
          tenantId: user.Attributes?.find(
            (attr) => attr.Name === 'custom:tenant_id',
          )?.Value,
          createdAt: user.UserCreateDate,
          updatedAt: user.UserLastModifiedDate,
          lastLogin: user.UserLastModifiedDate,
          groups: [], // Será preenchido separadamente se necessário
        }),
      );

      return {
        users,
        nextToken: response.PaginationToken,
      };
    } catch (error) {
      throw new Error(
        `Erro ao listar usuários: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const username = await this.findUsernameByEmail(email);
      if (!username) {
        return null;
      }

      const command = new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
      });

      const response = await this.cognitoClient.send(command);

      return UserMapper.toDomain({
        id: response.Username,
        email: response.UserAttributes?.find((attr) => attr.Name === 'email')
          ?.Value,
        name: response.UserAttributes?.find((attr) => attr.Name === 'name')
          ?.Value,
        email_verified:
          response.UserAttributes?.find(
            (attr) => attr.Name === 'email_verified',
          )?.Value === 'true',
        tenantId: response.UserAttributes?.find(
          (attr) => attr.Name === 'custom:tenant_id',
        )?.Value,
        createdAt: response.UserCreateDate,
        updatedAt: response.UserLastModifiedDate,
        lastLogin: response.UserLastModifiedDate,
        groups: response.UserAttributes?.find((attr) => attr.Name === 'groups')
          ?.Value,
      });
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        return null;
      }
      throw new Error(
        `Erro ao buscar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  async updateUser(email: string, userData: UpdateUserData): Promise<User> {
    try {
      const username = await this.findUsernameByEmail(email);
      if (!username) {
        throw new UserNotFoundError();
      }

      const attributes: Array<{ Name: string; Value: string }> = [];

      if (userData.name) {
        attributes.push({ Name: 'name', Value: userData.name });
      }

      if (userData.isEmailVerified !== undefined) {
        attributes.push({
          Name: 'email_verified',
          Value: userData.isEmailVerified.toString(),
        });
      }

      if (userData.userId) {
        attributes.push({
          Name: 'custom:user_id',
          Value: userData.userId,
        });
      }

      if (userData.picture) {
        attributes.push({
          Name: 'picture',
          Value: userData.picture,
        });
      }

      if (attributes.length > 0) {
        const command = new AdminUpdateUserAttributesCommand({
          UserPoolId: this.userPoolId,
          Username: username,
          UserAttributes: attributes,
        });

        await this.cognitoClient.send(command);
      }

      // Buscar usuário atualizado
      const updatedUser = await this.getUserByEmail(email);
      if (!updatedUser) {
        throw new UserNotFoundError();
      }

      return updatedUser;
    } catch (error) {
      if (
        error instanceof UserNotFoundException ||
        error instanceof UserNotFoundError
      ) {
        throw new UserNotFoundError();
      }
      throw new UserUpdateError(
        `Erro ao atualizar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  async deleteUser(email: string): Promise<void> {
    try {
      const username = await this.findUsernameByEmail(email);
      if (!username) {
        throw new UserNotFoundError();
      }

      const command = new AdminDeleteUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
      });

      await this.cognitoClient.send(command);
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw new UserNotFoundError();
      }
      throw new UserDeletionError(
        `Erro ao deletar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  async userExists(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    return user !== null;
  }

  async assignRole(username: string, role: UserRole): Promise<void> {
    try {
      const groupName = UserMapper.mapRoleToCognitoGroup(role);

      const command = new AdminAddUserToGroupCommand({
        UserPoolId: this.userPoolId,
        Username: username,
        GroupName: groupName,
      });

      await this.cognitoClient.send(command);
    } catch (error) {
      throw new RoleAssignmentError(
        `Erro ao atribuir role: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  async removeRole(email: string, role: UserRole): Promise<void> {
    try {
      const username = await this.findUsernameByEmail(email);
      if (!username) {
        throw new UserNotFoundError();
      }

      const groupName = UserMapper.mapRoleToCognitoGroup(role);

      const command = new AdminRemoveUserFromGroupCommand({
        UserPoolId: this.userPoolId,
        Username: username,
        GroupName: groupName,
      });

      await this.cognitoClient.send(command);
    } catch (error) {
      throw new RoleAssignmentError(
        `Erro ao remover role: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  async disableUser(email: string): Promise<void> {
    try {
      const username = await this.findUsernameByEmail(email);
      if (!username) {
        throw new UserNotFoundError();
      }

      const command = new AdminDisableUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
      });

      await this.cognitoClient.send(command);
      console.log(`Usuário ${email} desativado no Cognito`);
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw new UserNotFoundError();
      }
      throw new UserUpdateError(
        `Erro ao desativar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  async updateCustomAttribute(
    email: string,
    attributeName: string,
    attributeValue: string,
  ): Promise<void> {
    try {
      const username = await this.findUsernameByEmail(email);
      if (!username) {
        throw new UserNotFoundError();
      }

      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: this.userPoolId,
        Username: username,
        UserAttributes: [
          { Name: `custom:${attributeName}`, Value: attributeValue },
        ],
      });

      await this.cognitoClient.send(command);
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw new UserNotFoundError();
      }
      throw new UserUpdateError(
        `Erro ao atualizar custom attribute: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  async setPasswordPermanent(username: string, password: string): Promise<void> {
    try {
      const command = new AdminSetUserPasswordCommand({
        UserPoolId: this.userPoolId,
        Username: username,
        Password: password,
        Permanent: true,
      });

      await this.cognitoClient.send(command);
    } catch (error) {
      throw new UserUpdateError(
        `Erro ao definir senha permanente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  private buildFilter(filters: ListUsersFilters): string {
    const conditions: string[] = [];

    if (filters.tenantId) {
      conditions.push(`custom:tenant_id = "${filters.tenantId}"`);
    }

    if (filters.role) {
      // Para filtrar por role, precisaríamos listar grupos do Cognito
      // Por simplicidade, vamos deixar isso para uma implementação futura
    }

    return conditions.join(' AND ');
  }

  /**
   * Gera um username único baseado no nome
   * Formato: nome_sobrenome_timestamp_random
   */
  private generateUsername(name: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    // Limpar e formatar o nome
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '_') // Substitui espaços por underscore
      .substring(0, 20); // Limita o tamanho

    return `${cleanName}_${timestamp}_${random}`;
  }

  /**
   * Busca o username real do usuário pelo email
   * Necessário porque o Cognito usa username único, não email
   */
  private async findUsernameByEmail(email: string): Promise<string | null> {
    try {
      console.log(`🔍 Buscando username para email: ${email}`);

      // Busca com filtro de igualdade exata
      const command = new ListUsersCommand({
        UserPoolId: this.userPoolId,
        Filter: `email = "${email}"`,
        Limit: 1,
      });

      const response = await this.cognitoClient.send(command);

      console.log(`📊 Resposta da busca:`, {
        usersFound: response.Users?.length || 0,
        paginationToken: response.PaginationToken,
        hasUsers: !!response.Users,
      });

      if (response.Users && response.Users.length > 0) {
        const username = response.Users[0].Username;
        console.log(`Username encontrado: ${username}`);
        return username || null;
      }

      console.log(`❌ Nenhum usuário encontrado para email: ${email}`);
      return null;
    } catch (error) {
      console.error(`❌ Erro ao buscar username por email ${email}:`, error);
      return null;
    }
  }
}
