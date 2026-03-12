import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GeocodingResult {
  address: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
  provider: 'nominatim' | 'google' | 'cache';
}

/**
 * Serviço de Geocoding - Converte endereços em coordenadas
 * Suporta múltiplos providers: Nominatim (gratuito) e Google Maps API
 */
@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly cache = new Map<string, GeocodingResult>();
  private readonly googleApiKey: string;
  private readonly useGoogleMaps: boolean;

  constructor(private configService: ConfigService) {
    this.googleApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY', '');
    this.useGoogleMaps = !!this.googleApiKey;
    
    if (this.useGoogleMaps) {
      this.logger.log('✅ Geocoding configurado com Google Maps API');
    } else {
      this.logger.log('✅ Geocoding configurado com Nominatim (OpenStreetMap) - Gratuito');
    }
  }

  /**
   * Converte um endereço em coordenadas geográficas
   * Usa cache para evitar requisições repetidas
   */
  async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    if (!address || address.trim().length === 0) {
      this.logger.warn('Endereço vazio fornecido para geocoding');
      return null;
    }

    // Normalizar endereço para cache
    const normalizedAddress = this.normalizeAddress(address);
    
    // Verificar cache primeiro
    if (this.cache.has(normalizedAddress)) {
      this.logger.debug(`✅ Endereço encontrado em cache: ${address}`);
      return this.cache.get(normalizedAddress);
    }

    this.logger.debug(`🔍 Geocoding: ${address}`);

    try {
      let result: GeocodingResult | null;

      if (this.useGoogleMaps) {
        result = await this.geocodeWithGoogle(address);
      } else {
        result = await this.geocodeWithNominatim(address);
      }

      if (result) {
        // Salvar em cache
        this.cache.set(normalizedAddress, result);
        this.logger.log(`✅ Geocoding bem-sucedido: ${address} → ${result.latitude}, ${result.longitude}`);
      } else {
        this.logger.warn(`⚠️ Não foi possível geocodificar: ${address}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`❌ Erro ao geocodificar endereço "${address}":`, error.message);
      return null;
    }
  }

  /**
   * Geocoding usando Nominatim (OpenStreetMap) - GRATUITO
   * Limitação: 1 request por segundo (respeitamos isso com delay)
   */
  private async geocodeWithNominatim(address: string): Promise<GeocodingResult | null> {
    // Adicionar delay para respeitar rate limit do Nominatim (1 req/s)
    await this.delay(1000);

    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'NestJS-Healthcare-App/1.0', // Nominatim requer User-Agent
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        return null;
      }

      const result = data[0];
      return {
        address,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formattedAddress: result.display_name,
        provider: 'nominatim',
      };
    } catch (error) {
      this.logger.error('Erro ao usar Nominatim:', error.message);
      return null;
    }
  }

  /**
   * Geocoding usando Google Maps API - PAGO (mais preciso)
   * Requer GOOGLE_MAPS_API_KEY no .env
   */
  private async geocodeWithGoogle(address: string): Promise<GeocodingResult | null> {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.googleApiKey}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Google Maps API HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        this.logger.warn(`Google Maps status: ${data.status}`);
        return null;
      }

      const result = data.results[0];
      const location = result.geometry.location;

      return {
        address,
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        provider: 'google',
      };
    } catch (error) {
      this.logger.error('Erro ao usar Google Maps API:', error.message);
      return null;
    }
  }

  /**
   * Converte múltiplos endereços em lote
   * Adiciona delay entre requisições para respeitar rate limits
   */
  async geocodeBatch(addresses: string[]): Promise<Map<string, GeocodingResult>> {
    const results = new Map<string, GeocodingResult>();
    
    this.logger.log(`🔄 Geocoding em lote: ${addresses.length} endereços`);

    for (const address of addresses) {
      const result = await this.geocodeAddress(address);
      if (result) {
        results.set(address, result);
      }
      
      // Delay entre requisições (principalmente para Nominatim)
      if (!this.useGoogleMaps) {
        await this.delay(1100); // 1.1s para segurança
      } else {
        await this.delay(100); // 100ms para Google Maps
      }
    }

    this.logger.log(`✅ Geocoding concluído: ${results.size}/${addresses.length} endereços convertidos`);
    return results;
  }

  /**
   * Normaliza endereço para uso em cache
   */
  private normalizeAddress(address: string): string {
    return address
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Múltiplos espaços → espaço único
      .replace(/[.,;]+$/, ''); // Remove pontuação final
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Limpa o cache de geocoding
   */
  clearCache(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.log(`🧹 Cache de geocoding limpo: ${size} entradas removidas`);
  }

  /**
   * Retorna estatísticas do cache
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Pré-carrega endereços comuns em cache (útil na inicialização)
   */
  async preloadCommonAddresses(addresses: string[]): Promise<void> {
    this.logger.log(`📦 Pré-carregando ${addresses.length} endereços em cache...`);
    await this.geocodeBatch(addresses);
    this.logger.log(`✅ Pré-carga concluída: ${this.cache.size} endereços em cache`);
  }
}

