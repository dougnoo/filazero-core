import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../../../shared/domain/enums';
import { GroupType } from '@aws-sdk/client-cognito-identity-provider';

export class UserMapper {
  static toDomain(cognitoUser: any, groups?: GroupType[]): User {
    const attributes = cognitoUser.UserAttributes || cognitoUser.Attributes;
    const attributeMap = attributes.reduce((acc: any, attr: any) => {
      acc[attr.Name] = attr.Value;
      return acc;
    }, {});

    // Extract role using multi-source priority approach
    const role = this.extractRole(attributes, groups);

    // NOTA: GetUserCommand (usado com AccessToken) não retorna UserCreateDate/UserLastModifiedDate
    // Essas propriedades só estão disponíveis no AdminGetUserCommand
    // Para datas precisas, use os dados do banco de dados local (UserDbRepository)
    // Aqui usamos Date.now() como fallback, mas essas datas não devem ser usadas
    // para lógica de negócio - são apenas para compatibilidade com a entidade User
    const createdAt = cognitoUser.UserCreateDate
      ? new Date(cognitoUser.UserCreateDate)
      : new Date();
    const updatedAt = cognitoUser.UserLastModifiedDate
      ? new Date(cognitoUser.UserLastModifiedDate)
      : new Date();

    return new User(
      attributeMap['sub'], // id
      attributeMap['email'],
      role,
      attributeMap['email_verified'] === 'true',
      createdAt,
      updatedAt,
      attributeMap['sub'], // cognitoId (mesmo que id neste contexto)
      attributeMap['name'],
      attributeMap['phone_number'],
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
  private static extractRole(
    attributes: any[],
    groups?: GroupType[],
  ): UserRole {
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

    // 2. Tentar obter dos grupos do Cognito
    // Pegar o primeiro grupo que seja uma role válida
    if (groups && groups.length > 0) {
      for (const group of groups) {
        if (group.GroupName && this.isValidRole(group.GroupName)) {
          return group.GroupName as UserRole;
        }
      }
    }

    // 3. Se não encontrar, lançar erro
    throw new Error('Role não encontrada para o usuário');
  }

  /**
   * Valida se a string é uma role válida
   */
  private static isValidRole(role: string): boolean {
    return Object.values(UserRole).includes(role as UserRole);
  }
}
