import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LocationEntity } from '../../infrastructure/entities/location.entity';
import { GooglePlacesService } from './google-places.service';

interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private isProcessing = false;

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepository: Repository<LocationEntity>,
    private readonly googlePlacesService: GooglePlacesService,
  ) {}

  /**
   * Cron job que roda a cada 5 minutos para processar locations pendentes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processGeocodingQueue() {
    if (this.isProcessing) {
      this.logger.log('Geocoding already in progress, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      // Buscar locations pendentes (100 por execução)
      const pendingLocations = await this.locationRepository.find({
        where: { geocodingStatus: 'pending' },
        relations: ['providers'],
        take: 150,
        order: { hash: 'ASC' },
      });

      if (pendingLocations.length === 0) {
        this.logger.log('No pending locations to geocode');
        return;
      }

      this.logger.log(
        `Processing ${pendingLocations.length} pending locations`,
      );

      let successCount = 0;
      let failedCount = 0;

      for (const location of pendingLocations) {
        try {
          // Tentar primeiro com Google Places se houver provider name disponível
          let googleResult: Awaited<ReturnType<typeof this.googlePlacesService.searchPlace>> = null;
          if (location.providers && location.providers.length > 0) {
            const providerName = location.providers[0].name;
            googleResult = await this.googlePlacesService.searchPlace(
              providerName,
              location.fullAddress,
            );
          }

          // Se Google Places funcionou, usar seus dados
          if (googleResult && googleResult.lat && googleResult.lng) {
            location.latitude = googleResult.lat;
            location.longitude = googleResult.lng;
            location.googlePlaceId = googleResult.placeId;
            location.googleRating = googleResult.rating;
            location.googleUserRatingsTotal = googleResult.userRatingsTotal;
            location.googleWeekdayText = googleResult.weekdayText;
            location.googlePriceLevel = googleResult.priceLevel;
            location.googlePlaceUrl = googleResult.url;
            location.googleLastFetchedAt = new Date();
            location.geocodingStatus = 'success';
            location.geocodedAt = new Date();
            location.geocodingProvider = 'google_places';
            successCount++;

            this.logger.log(
              `[${location.hash.substring(0, 8)}] ✓ Google Places: ${location.providers[0].name} - Rating: ${googleResult.rating || 'N/A'}`,
            );
          } else {
            // Fallback para Nominatim se Google Places falhar
            const nominatimResult = await this.geocodeLocation(location);

            if (nominatimResult) {
              location.latitude = nominatimResult.lat;
              location.longitude = nominatimResult.lon;
              location.geocodingStatus = 'success';
              location.geocodedAt = new Date();
              location.geocodingProvider = 'nominatim';
              successCount++;
            } else {
              location.geocodingStatus = 'failed';
              location.geocodingAttempts = (location.geocodingAttempts || 0) + 1;
              failedCount++;
            }
          }

          await this.locationRepository.save(location);

          // Rate limit: 1 segundo entre requests
          await this.delay(1000);
        } catch (error) {
          this.logger.error(
            `Error geocoding location ${location.hash}: ${error.message}`,
          );
          location.geocodingStatus = 'failed';
          location.geocodingAttempts = (location.geocodingAttempts || 0) + 1;
          await this.locationRepository.save(location);
          failedCount++;
        }
      }

      this.logger.log(
        `Geocoding completed: ${successCount} success, ${failedCount} failed`,
      );
    } catch (error) {
      this.logger.error(`Geocoding queue processing failed: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Geocodifica uma location específica usando query estruturada
   * Mais preciso que query livre
   */
  private async geocodeLocation(
    location: LocationEntity,
  ): Promise<GeocodingResult | null> {
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      
      // Usar query estruturada para melhor precisão
      if (location.postalCode) {
        url.searchParams.append('postalcode', location.postalCode);
      }
      
      if (location.streetName) {
        // Limpar detalhes desnecessários do nome da rua
        let cleanStreet = location.streetName
          .replace(/\s*BLOCO\s+[A-Z]/gi, '')
          .replace(/\s*CONJUNTO\s+[IVX]+/gi, '')
          .replace(/\s*TORRE\s+\d+/gi, '')
          .replace(/\s*SALA\s+[\d\-A-Z]+/gi, '')
          .replace(/\s*S\/N/gi, '')
          .replace(/\s+PARTE\s+.*/gi, '')
          .replace(/\s+\d+\s+ANDAR/gi, '')
          .replace(/\s+ENTRADA\s+\d+/gi, '')
          .replace(/\s+EDIFICIO\s+.*/gi, '')
          .trim();
        
        // Incluir tipo de logradouro + nome + número
        const streetParts: string[] = [];
        if (location.streetType) {
          streetParts.push(location.streetType);
        }
        streetParts.push(cleanStreet);
        if (location.streetNumber) {
          streetParts.push(location.streetNumber);
        }
        url.searchParams.append('street', streetParts.join(' '));
      }
      
      if (location.city) {
        url.searchParams.append('city', location.city);
      }
      
      if (location.state) {
        url.searchParams.append('state', location.state);
      }
      
      url.searchParams.append('country', 'Brasil');
      url.searchParams.append('format', 'json');
      url.searchParams.append('limit', '1');

      const logAddress = `${location.streetName || ''} ${location.streetNumber || ''}, ${location.city}, ${location.state} ${location.postalCode || ''}`.trim();
      this.logger.log(
        `[${location.hash.substring(0, 8)}] Geocoding: ${logAddress}`,
      );

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'TryaPlatform/1.0',
        },
      });

      if (!response.ok) {
        this.logger.error(
          `[${location.hash.substring(0, 8)}] Nominatim API error: ${response.statusText}`,
        );
        return null;
      }

      const data: NominatimResponse[] = await response.json();

      if (data.length === 0) {
        this.logger.warn(
          `[${location.hash.substring(0, 8)}] GEOCODING FAILED - ${logAddress}`,
        );
        return null;
      }

      this.logger.log(
        `[${location.hash.substring(0, 8)}] ✓ Found: ${data[0].display_name}`,
      );

      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name,
      };
    } catch (error) {
      this.logger.error(
        `[${location.hash.substring(0, 8)}] Error geocoding: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Formata um endereço brasileiro para geocodificação
   * Otimizado para OpenStreetMap/Nominatim com limpeza de detalhes desnecessários
   */
  private formatAddressForGeocoding(location: LocationEntity): string {
    // Estratégia especial para Brasília: limpar detalhes mas manter endereço específico
    if (location.state === 'DF' && location.streetName) {
      let simplifiedStreet = location.streetName;

      // Remover detalhes específicos que o Nominatim não reconhece bem
      simplifiedStreet = simplifiedStreet
        .replace(/\s*BLOCO\s+[A-Z]/gi, '') // Remove BLOCO A, B, C
        .replace(/\s*CONJUNTO\s+[IVX]+/gi, '') // Remove CONJUNTO I, II
        .replace(/\s*TORRE\s+\d+/gi, '') // Remove TORRE 1, 2
        .replace(/\s*SALA\s+[\d\-A-Z]+/gi, '') // Remove SALA
        .replace(/\s*S\/N/gi, '') // Remove S/N
        .replace(/\s+PARTE\s+.*/gi, '') // Remove "PARTE -..."
        .replace(/\s+\d+\s+ANDAR/gi, '') // Remove piso
        .replace(/\s+ENTRADA\s+\d+/gi, '') // Remove ENTRADA
        .replace(/\s+EDIFICIO\s+.*/gi, '') // Remove nome do edifício
        .trim();

      // Manter o número se houver
      const parts = [simplifiedStreet];
      if (location.streetNumber) {
        parts.push(location.streetNumber);
      }
      if (location.neighborhood) {
        parts.push(location.neighborhood);
      }
      parts.push('Brasília', 'DF', 'Brasil');
      return parts.join(', ');
    }

    // Para outros estados, formato padrão
    // Verificar códigos especiais de Brasília (caso o state não seja DF mas seja Brasília)
    if (location.streetName?.match(/^(QN|SH|SQ|EQ|CL|SCLRN|SHCGN|SQSW|SQNW)/i)) {
      const parts = [
        location.streetName,
        location.streetNumber,
        location.city,
        location.state,
        'Brasil',
      ].filter(Boolean);
      return parts.join(', ');
    }

    // Para endereços normais, formato mais completo
    const parts = [
      location.streetType,
      location.streetName,
      location.streetNumber,
      location.neighborhood,
      location.city,
      location.state,
      'Brasil',
    ].filter(Boolean);

    return parts.join(', ');
  }

  /**
   * Adiciona delay entre requisições para respeitar rate limit
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Método manual para forçar processamento de todas as locations pendentes
   */
  async processAllPending(): Promise<{
    total: number;
    success: number;
    failed: number;
  }> {
    this.logger.log('Manual geocoding process started');

    const pendingLocations = await this.locationRepository.find({
      where: { geocodingStatus: 'pending' },
    });

    let successCount = 0;
    let failedCount = 0;

    for (const location of pendingLocations) {
      try {
        const result = await this.geocodeLocation(location);

        if (result) {
          location.latitude = result.lat;
          location.longitude = result.lon;
          location.geocodingStatus = 'success';
          location.geocodedAt = new Date();
          successCount++;
        } else {
          location.geocodingStatus = 'failed';
          location.geocodingAttempts = (location.geocodingAttempts || 0) + 1;
          failedCount++;
        }

        await this.locationRepository.save(location);

        // Respeitar rate limit
        await this.delay(1000);
      } catch (error) {
        this.logger.error(
          `Error geocoding location ${location.hash}: ${error.message}`,
        );
        location.geocodingStatus = 'failed';
        location.geocodingAttempts = (location.geocodingAttempts || 0) + 1;
        await this.locationRepository.save(location);
        failedCount++;
      }
    }

    this.logger.log(
      `Manual geocoding completed: ${successCount} success, ${failedCount} failed`,
    );

    return {
      total: pendingLocations.length,
      success: successCount,
      failed: failedCount,
    };
  }

  /**
   * Reprocessar locations que falharam
   */
  async retryFailedLocations(): Promise<{
    total: number;
    success: number;
    failed: number;
  }> {
    this.logger.log('Retrying failed geocoding');

    const failedLocations = await this.locationRepository.find({
      where: { geocodingStatus: 'failed' },
    });

    let successCount = 0;
    let failedCount = 0;

    for (const location of failedLocations) {
      try {
        const result = await this.geocodeLocation(location);

        if (result) {
          location.latitude = result.lat;
          location.longitude = result.lon;
          location.geocodingStatus = 'success';
          location.geocodedAt = new Date();
          successCount++;
        } else {
          location.geocodingAttempts = (location.geocodingAttempts || 0) + 1;
          failedCount++;
        }

        await this.locationRepository.save(location);
        await this.delay(1000);
      } catch (error) {
        this.logger.error(
          `Error retrying location ${location.hash}: ${error.message}`,
        );
        location.geocodingAttempts = (location.geocodingAttempts || 0) + 1;
        await this.locationRepository.save(location);
        failedCount++;
      }
    }

    this.logger.log(
      `Retry completed: ${successCount} success, ${failedCount} failed`,
    );

    return {
      total: failedLocations.length,
      success: successCount,
      failed: failedCount,
    };
  }

  /**
   * Obter estatísticas de geocoding
   */
  async getGeocodingStats(): Promise<{
    total: number;
    pending: number;
    success: number;
    failed: number;
    successRate: number;
  }> {
    const [total, pending, success, failed] = await Promise.all([
      this.locationRepository.count(),
      this.locationRepository.count({ where: { geocodingStatus: 'pending' } }),
      this.locationRepository.count({ where: { geocodingStatus: 'success' } }),
      this.locationRepository.count({ where: { geocodingStatus: 'failed' } }),
    ]);

    return {
      total,
      pending,
      success,
      failed,
      successRate: total > 0 ? (success / total) * 100 : 0,
    };
  }

  /**
   * Listar locations que falharam no geocoding com detalhes
   */
  async getFailedLocations(): Promise<
    Array<{
      hash: string;
      fullAddress: string;
      postalCode: string;
      city: string;
      state: string;
      attempts: number;
      formattedForGeocoding: string;
    }>
  > {
    const failedLocations = await this.locationRepository.find({
      where: { geocodingStatus: 'failed' },
      order: { geocodingAttempts: 'DESC' },
      take: 50,
    });

    return failedLocations.map((location) => ({
      hash: location.hash,
      fullAddress: location.fullAddress,
      postalCode: location.postalCode,
      city: location.city,
      state: location.state,
      attempts: location.geocodingAttempts || 0,
      formattedForGeocoding: this.formatAddressForGeocoding(location),
    }));
  }

  /**
   * Reset locations de um estado específico para pending (para re-geocoding)
   */
  async resetLocationsToRetry(state: string): Promise<number> {
    const locations = await this.locationRepository.find({
      where: {
        state: state,
        geocodingStatus: 'success',
      },
    });

    this.logger.log(`Resetting ${locations.length} locations from ${state} to pending`);

    for (const location of locations) {
      location.geocodingStatus = 'pending';
      location.latitude = undefined;
      location.longitude = undefined;
      location.geocodedAt = undefined;
    }

    await this.locationRepository.save(locations);
    return locations.length;
  }
}
