import { ConfigData } from '../entities/config-data.entity';

export interface IConfigRepository {
  /**
   * Busca configuração por tenant e chave
   * @param tenantName - Nome do tenant
   * @param configKey - Chave da configuração (ex: 'theme', 'bucketName')
   * @returns Dados da configuração ou null se não encontrado
   */
  getConfig(tenantName: string, configKey: string): Promise<ConfigData | null>;

  /**
   * Salva configuração para um tenant
   * @param tenantName - Nome do tenant
   * @param configKey - Chave da configuração
   * @param configData - Dados da configuração
   */
  saveConfig(
    tenantName: string,
    configKey: string,
    configData: ConfigData,
  ): Promise<void>;

  /**
   * Remove configuração de um tenant
   * @param tenantName - Nome do tenant
   * @param configKey - Chave da configuração
   */
  deleteConfig(tenantName: string, configKey: string): Promise<void>;
}
