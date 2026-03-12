/**
 * Entidade que representa a configuração de bucket S3 de um tenant
 */
export interface BucketConfig {
  /**
   * Nome do bucket S3
   */
  name: string;
  /**
   * Região AWS do bucket (opcional)
   */
  region?: string;
}
