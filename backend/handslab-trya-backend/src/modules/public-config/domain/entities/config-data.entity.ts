import { ThemeConfig } from './theme-config.entity';
import { BucketConfig } from './bucket-config.entity';

/**
 * Union type para todos os tipos de configuração possíveis
 */
export type ConfigData = ThemeConfig | BucketConfig | Record<string, unknown>;

/**
 * Type guard para verificar se é ThemeConfig
 */
export function isThemeConfig(config: ConfigData): config is ThemeConfig {
  return (
    'primaryColor' in config &&
    'secondaryColor' in config &&
    'logo' in config &&
    'favicon' in config &&
    'loginBackground' in config
  );
}

/**
 * Type guard para verificar se é BucketConfig
 */
export function isBucketConfig(config: ConfigData): config is BucketConfig {
  return 'name' in config && typeof (config as BucketConfig).name === 'string';
}
