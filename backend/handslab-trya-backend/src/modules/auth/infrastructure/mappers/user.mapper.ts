import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

@Injectable()
export class UserMapper {
  /**
   * Mapeia dados do Cognito para a entidade User
   *
   * @param cognitoUser - Dados do usuário do Cognito (GetUser response)
   * @param tokenPayload - Payload decodificado do Access Token ou ID Token (opcional)
   *                       Contém informações como cognito:groups, custom claims, etc.
   */
  toDomain(cognitoUser: any, tokenPayload?: any): User {
    const attributes =
      cognitoUser.UserAttributes || cognitoUser.Attributes || [];

    const getAttribute = (name: string): string | undefined => {
      const attr = attributes.find((a: any) => a.Name === name);
      return attr?.Value;
    };

    const email = getAttribute('email') || '';
    const name = getAttribute('name') || getAttribute('given_name') || '';
    const emailVerified = getAttribute('email_verified') === 'true';
    // Usar 'sub' (cognito_id real) como prioridade para busca no banco
    // O 'custom:user_id' contém o ID da tabela users, não o cognito_id
    const userId = getAttribute('sub') || cognitoUser.Username || '';
    const dbId = getAttribute('custom:user_id') || undefined; // ID do PostgreSQL, se disponível
    // Obter role - Suporta múltiplas fontes
    const role = this.extractRole(attributes, tokenPayload);

    // Obter tenantId - Suporta atributo customizado ou do token
    const tenantId = this.extractTenantId(attributes, tokenPayload);

    // Datas
    const createdAt = cognitoUser.UserCreateDate
      ? new Date(cognitoUser.UserCreateDate)
      : new Date();
    const updatedAt = cognitoUser.UserLastModifiedDate
      ? new Date(cognitoUser.UserLastModifiedDate)
      : createdAt;

    return new User(
      userId,
      email,
      name,
      role,
      tenantId,
      emailVerified,
      createdAt,
      updatedAt,      
      undefined, // lastLogin
      dbId
    );
  }

  /**
   * Extrai a role do usuário de múltiplas fontes
   * Prioridade:
   * 1. Atributo custom:role (atributo customizado do Cognito)
   * 2. Grupo do Cognito (cognito:groups no Access Token ou ID Token)
   * 3. Lança erro se não encontrar (obrigatório)
   *
   * Nota: O cognito:groups vem automaticamente no Access Token quando o usuário
   * pertence a grupos do Cognito User Pool
   */
  private extractRole(attributes: any[], tokenPayload?: any): UserRole {
    // 1. Tentar obter do atributo customizado
    const customRoleAttr = attributes.find(
      (a: any) => a.Name === 'custom:role',
    );
    if (customRoleAttr?.Value) {
      const role = customRoleAttr.Value as UserRole;
      if (this.isValidRole(role)) {
        return role;
      }
    }

    // 2. Tentar obter dos grupos do Cognito (via Access Token ou ID Token)
    // O Access Token sempre contém cognito:groups quando o usuário está em grupos
    if (tokenPayload?.['cognito:groups']?.length > 0) {
      const groups = tokenPayload['cognito:groups'];

      // Pegar o primeiro grupo que seja uma role válida
      for (const group of groups) {
        if (this.isValidRole(group)) {
          return group;
        }
      }
    }

    // 3. Valor padrão
    throw new Error('Role não encontrada');
  }

  /**
   * Extrai o tenantId do usuário
   * Prioridade:
   * 1. Atributo custom:tenant_id (snake_case - formato do Cognito)
   * 2. Atributo custom:tenantId (camelCase - compatibilidade)
   * 3. Claim custom:tenant_id no token (se configurado)
   * 4. Claim custom:tenantId no token (compatibilidade)
   */
  private extractTenantId(attributes: any[], tokenPayload?: any): string {
    // Tentar do atributo customizado (snake_case - formato padrão do Cognito)
    const tenantAttrSnake = attributes.find(
      (a: any) => a.Name === 'custom:tenant_id',
    );
    if (tenantAttrSnake?.Value) {
      return tenantAttrSnake.Value;
    }

    // Tentar do atributo customizado (camelCase - compatibilidade)
    const tenantAttrCamel = attributes.find(
      (a: any) => a.Name === 'custom:tenantId',
    );
    if (tenantAttrCamel?.Value) {
      return tenantAttrCamel.Value;
    }

    // Tentar do token (snake_case)
    if (tokenPayload?.['custom:tenant_id']) {
      return tokenPayload['custom:tenant_id'];
    }

    // Tentar do token (camelCase - compatibilidade)
    if (tokenPayload?.['custom:tenantId']) {
      return tokenPayload['custom:tenantId'];
    }

    return '';
  }

  /**
   * Valida se a string é uma role válida
   */
  private isValidRole(role: string): role is UserRole {
    return Object.values(UserRole).includes(role as UserRole);
  }

  /**
   * Mapeia múltiplos usuários do Cognito
   */
  toDomainList(cognitoUsers: any[]): User[] {
    return cognitoUsers.map((user) => this.toDomain(user));
  }
}
