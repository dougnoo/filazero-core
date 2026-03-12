/**
 * Representa o usuário extraído do JWT após validação pelo Passport
 */
export interface JwtUser {
  /** Cognito sub - ID único do usuário no Cognito */
  cognitoId: string;
  /** Username do Cognito */
  username: string;
  /** Role principal (primeiro grupo do Cognito) */
  role?: string;
  /** Todos os grupos do Cognito */
  groups: string[];
}
