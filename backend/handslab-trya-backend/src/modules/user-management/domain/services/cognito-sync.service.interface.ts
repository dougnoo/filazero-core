/**
 * Interface para sincronização de dados com o Cognito (Domain Layer)
 */

export interface CognitoSyncData {
  email?: string;
  name?: string;
  phone?: string;
  tenantId?: string;
}

export abstract class ICognitoSyncService {
  /**
   * Sincroniza atributos do beneficiário com o Cognito
   * @param userEmail - Email do usuário (usado como username no Cognito)
   * @param data - Dados a serem sincronizados
   */
  abstract syncBeneficiaryAttributes(
    userEmail: string,
    data: CognitoSyncData,
  ): Promise<void>;
}
