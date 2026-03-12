import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface GooglePlaceDetails {
  placeId: string;
  rating?: number;
  userRatingsTotal?: number;
  weekdayText?: string[];
  priceLevel?: { level: number; label: string };
  lat?: number;
  lng?: number;
  url?: string;
}

/**
 * Converte o price_level do Google Places (nova API) em objeto estruturado
 * @param level String do nível de preço (PRICE_LEVEL_INEXPENSIVE, etc)
 * @returns Objeto com level numérico e label descritivo
 */
function formatPriceLevel(priceLevel?: string): { level: number; label: string } | undefined {
  if (!priceLevel) return undefined;
  
  const mapping: Record<string, { level: number; label: string }> = {
    'PRICE_LEVEL_FREE': { level: 0, label: 'Gratuito' },
    'PRICE_LEVEL_INEXPENSIVE': { level: 1, label: 'Barato' },
    'PRICE_LEVEL_MODERATE': { level: 2, label: 'Moderado' },
    'PRICE_LEVEL_EXPENSIVE': { level: 3, label: 'Caro' },
    'PRICE_LEVEL_VERY_EXPENSIVE': { level: 4, label: 'Muito Caro' },
  };

  return mapping[priceLevel] || undefined;
}

@Injectable()
export class GooglePlacesService {
  private readonly logger = new Logger(GooglePlacesService.name);
  private readonly apiKey: string | undefined;
  private readonly baseUrl = 'https://places.googleapis.com/v1';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY');

    if (!this.apiKey) {
      this.logger.warn(
        'GOOGLE_PLACES_API_KEY not configured. Google Places features will be disabled.',
      );
    } else {
      this.logger.log('✅ Google Places API (NEW v1) configured');
    }
  }

  /**
   * Busca place usando nova Places API (v1) com Text Search
   * Usa apenas campos Essentials ($5/1k) para pegar place_id,
   * depois busca detalhes completos com Place Details ($17/1k)
   * @param name Nome do estabelecimento (ex: "Hospital São Lucas")
   * @param address Endereço completo do local
   * @returns Detalhes completos incluindo rating, horários, etc
   */
  async searchPlace(
    name: string,
    address: string,
  ): Promise<GooglePlaceDetails | null> {
    if (!this.apiKey) {
      this.logger.warn('Google Places API key not configured, skipping search');
      return null;
    }

    try {
      const query = `${name}, ${address}`;
      this.logger.debug(`Searching Google Places (NEW API): "${query}"`);

      // Text Search (NEW API) - apenas campos Essentials = $5/1k
      const searchResponse = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/places:searchText`,
          {
            textQuery: query,
            languageCode: 'pt-BR',
            regionCode: 'br',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': this.apiKey,
              // Apenas campos Essentials ID Only = $5/1k (location ativa Pro!)
              'X-Goog-FieldMask': 'places.id,places.name',
            },
            timeout: 10000,
          },
        ),
      );

      const places = searchResponse.data.places;
      if (!places || places.length === 0) {
        this.logger.warn(`No results found for: "${query}"`);
        return null;
      }

      const place = places[0];
      const placeId = place.id;

      if (!placeId) {
        this.logger.warn(`No place ID in result for: "${query}"`);
        return null;
      }

      // Place Details (NEW API) - campos Pro/Enterprise = $17/1k
      // Economia: $32 (Text Search Pro antiga) -> $5 (Text Search Essentials) = $27/1k!
      this.logger.debug(`Fetching details for: ${placeId}`);

      const detailsResponse = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/places/${placeId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': this.apiKey,
              // Campos Pro + Enterprise
              'X-Goog-FieldMask': 'id,location,rating,userRatingCount,regularOpeningHours,priceLevel,googleMapsUri',
            },
            params: {
              languageCode: 'pt-BR',
            },
            timeout: 10000,
          },
        ),
      );

      const details = detailsResponse.data;

      const result: GooglePlaceDetails = {
        placeId: details.id,
        rating: details.rating,
        userRatingsTotal: details.userRatingCount,
        weekdayText: details.regularOpeningHours?.weekdayDescriptions,
        priceLevel: formatPriceLevel(details.priceLevel),
        lat: details.location?.latitude,
        lng: details.location?.longitude,
        url: details.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      };

      this.logger.log(
        `✓ Found: ${name} - Rating: ${result.rating || 'N/A'} - Hours: ${result.weekdayText ? 'Yes' : 'No'}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error searching Google Places for "${name}": ${error.message}`,
      );

      // Log more details if available
      if (error.response?.data) {
        this.logger.error(
          `API Error: ${JSON.stringify(error.response.data)}`,
        );
      }

      return null;
    }
  }

  /**
   * Busca detalhes de um lugar usando Place Details (NEW API)
   * Usado para atualização mensal de dados de places já conhecidos
   * @param placeId Google Place ID no formato "places/ChIJ..."
   * @returns Detalhes atualizados incluindo rating e horários
   */
  async getPlaceDetails(
    placeId: string,
  ): Promise<Omit<GooglePlaceDetails, 'placeId'> | null> {
    if (!this.apiKey) {
      this.logger.warn('Google Places API key not configured, skipping details');
      return null;
    }

    try {
      this.logger.debug(`Fetching details for: ${placeId}`);

      // Place Details (NEW API) - $17/1k
      const detailsResponse = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/${placeId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': this.apiKey,
              'X-Goog-FieldMask': 'id,location,rating,userRatingCount,regularOpeningHours,priceLevel,googleMapsUri',
            },
            params: {
              languageCode: 'pt-BR',
            },
            timeout: 10000,
          },
        ),
      );

      const details = detailsResponse.data;

      if (!details) {
        this.logger.warn(`No details found for: ${placeId}`);
        return null;
      }

      const result = {
        rating: details.rating,
        userRatingsTotal: details.userRatingCount,
        weekdayText: details.regularOpeningHours?.weekdayDescriptions,
        priceLevel: formatPriceLevel(details.priceLevel),
        lat: details.location?.latitude,
        lng: details.location?.longitude,
        url: details.googleMapsUri,
      };

      this.logger.log(
        `✓ Details: Rating: ${result.rating || 'N/A'} (${result.userRatingsTotal || 0} reviews)`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching Place Details for "${placeId}": ${error.message}`,
      );

      // Log more details if available
      if (error.response?.data) {
        this.logger.error(
          `API Error: ${JSON.stringify(error.response.data)}`,
        );
      }

      return null;
    }
  }

  /**
   * Valida se a API key está configurada e funcionando
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      // Fazer uma busca simples para validar a chave
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/places:searchText`,
          {
            textQuery: 'Hospital São Paulo, Brasil',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': this.apiKey,
              'X-Goog-FieldMask': 'places.id',
            },
            timeout: 5000,
          },
        ),
      );

      return !!response.data;
    } catch (error) {
      this.logger.error(`Invalid Google Places API key: ${error.message}`);
      return false;
    }
  }

  /**
   * Delay helper para rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
