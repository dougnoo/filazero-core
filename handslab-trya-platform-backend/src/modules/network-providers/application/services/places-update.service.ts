import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThan } from 'typeorm';
import { LocationEntity } from '../../infrastructure/entities/location.entity';
import { GooglePlacesService } from './google-places.service';

@Injectable()
export class PlacesUpdateService {
  private readonly logger = new Logger(PlacesUpdateService.name);
  private isProcessing = false;

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepository: Repository<LocationEntity>,
    private readonly googlePlacesService: GooglePlacesService,
  ) {}

  /**
   * Cron job que roda a cada 5 minutos para atualizar dados do Google Places
   * Processa 100 locations por execução, priorizando as que não foram atualizadas há mais de 30 dias
   * Dessa forma, distribui a atualização de todas as locations ao longo do mês
   */
  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'update-google-places-data',
    timeZone: 'America/Sao_Paulo',
  })
  async updateGooglePlacesData() {
    if (this.isProcessing) {
      this.logger.log('Google Places update already in progress, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      this.logger.log('Starting monthly Google Places data update...');

      // Buscar locations que precisam ser atualizadas
      // Prioridade: nunca atualizadas (null) > atualizadas há mais de 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const locationsToUpdate = await this.locationRepository
        .createQueryBuilder('location')
        .leftJoin('location.providers', 'provider')
        .where('location.geocodingStatus = :status', { status: 'success' })
        .andWhere('location.latitude IS NOT NULL')
        .andWhere('location.longitude IS NOT NULL')
        .andWhere(
          '(location.googleLastFetchedAt IS NULL OR location.googleLastFetchedAt < :thirtyDaysAgo)',
          { thirtyDaysAgo },
        )
        .select([
          'location.hash',
          'location.fullAddress',
          'location.city',
          'location.state',
          'provider.name',
        ])
        .orderBy('location.googleLastFetchedAt', 'ASC', 'NULLS FIRST')
        .addOrderBy('provider.name', 'ASC')
        .limit(100) // Processar 100 locations por execução
        .getMany();

      if (locationsToUpdate.length === 0) {
        this.logger.log('No locations to update');
        return;
      }

      this.logger.log(
        `Found ${locationsToUpdate.length} locations to update with Google Places data`,
      );

      let successCount = 0;
      let failedCount = 0;
      let skippedCount = 0;

      for (const location of locationsToUpdate) {
        try {
          // Verificar se há pelo menos um provider para essa location
          if (!location.providers || location.providers.length === 0) {
            this.logger.warn(
              `Location ${location.hash} has no providers, skipping`,
            );
            skippedCount++;
            continue;
          }

          // Usar o nome do primeiro provider para a busca
          const providerName = location.providers[0].name;

          this.logger.debug(
            `[${location.hash}] Updating: ${providerName} - ${location.fullAddress}`,
          );

          // Buscar dados no Google Places usando Place Details (mais barato)
          // Requer que já tenhamos o place_id da busca inicial
          if (!location.googlePlaceId) {
            this.logger.warn(
              `[${location.hash}] No place_id found, skipping (needs initial geocoding first)`,
            );
            skippedCount++;
            continue;
          }

          const placeDetails = await this.googlePlacesService.getPlaceDetails(
            location.googlePlaceId,
          );

          if (placeDetails) {
            // Atualizar location com os dados do Google Places
            await this.locationRepository.update(
              { hash: location.hash },
              {
                googleRating: placeDetails.rating,
                googleUserRatingsTotal: placeDetails.userRatingsTotal,
                googleWeekdayText: placeDetails.weekdayText,
                googlePriceLevel: placeDetails.priceLevel,
                googlePlaceUrl: placeDetails.url,
                googleLastFetchedAt: new Date(),
                // Atualizar coordenadas se o Google retornar valores mais precisos
                ...(placeDetails.lat &&
                  placeDetails.lng && {
                    latitude: placeDetails.lat,
                    longitude: placeDetails.lng,
                  }),
              },
            );

            successCount++;
            this.logger.log(
              `[${location.hash}] ✓ Updated: ${providerName} - Rating: ${placeDetails.rating || 'N/A'}`,
            );
          } else {
            // Marcar como tentado mesmo que não encontrou dados
            await this.locationRepository.update(
              { hash: location.hash },
              {
                googleLastFetchedAt: new Date(),
              },
            );

            failedCount++;
            this.logger.warn(
              `[${location.hash}] No data found for: ${providerName}`,
            );
          }

          // Rate limiting: aguardar 100ms entre requisições
          // Google Places permite até 50 req/s, mas vamos ser conservadores
          await this.delay(100);
        } catch (error) {
          this.logger.error(
            `Error updating location ${location.hash}: ${error.message}`,
          );

          // Marcar como tentado para não ficar preso em erro
          await this.locationRepository.update(
            { hash: location.hash },
            {
              googleLastFetchedAt: new Date(),
            },
          );

          failedCount++;
        }
      }

      this.logger.log(
        `Google Places update completed: ${successCount} success, ${failedCount} failed, ${skippedCount} skipped`,
      );
    } catch (error) {
      this.logger.error(
        `Fatal error in Google Places update job: ${error.message}`,
      );
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Método manual para forçar atualização de locations específicas
   * Pode ser chamado via endpoint admin
   */
  async updateSpecificLocations(
    locationHashes: string[],
  ): Promise<{ success: number; failed: number }> {
    let successCount = 0;
    let failedCount = 0;

    for (const hash of locationHashes) {
      try {
        const location = await this.locationRepository.findOne({
          where: { hash },
          relations: ['providers'],
        });

        if (!location) {
          this.logger.warn(`Location ${hash} not found`);
          failedCount++;
          continue;
        }

        if (!location.providers || location.providers.length === 0) {
          this.logger.warn(`Location ${hash} has no providers`);
          failedCount++;
          continue;
        }

        const providerName = location.providers[0].name;

        // Se já tem place_id, usar Place Details (mais barato)
        // Senão, usar Text Search para obter place_id
        if (location.googlePlaceId) {
          const details = await this.googlePlacesService.getPlaceDetails(
            location.googlePlaceId,
          );

          if (details) {
            await this.locationRepository.update(
              { hash },
              {
                googleRating: details.rating,
                googleUserRatingsTotal: details.userRatingsTotal,
                googleWeekdayText: details.weekdayText,
                googlePriceLevel: details.priceLevel,
                googlePlaceUrl: details.url,
                googleLastFetchedAt: new Date(),
                ...(details.lat &&
                  details.lng && {
                    latitude: details.lat,
                    longitude: details.lng,
                  }),
              },
            );
            successCount++;
          } else {
            failedCount++;
          }
        } else {
          // Primeira busca - usar Text Search
          const placeDetails = await this.googlePlacesService.searchPlace(
            providerName,
            location.fullAddress,
          );

          if (placeDetails) {
            await this.locationRepository.update(
              { hash },
              {
                googlePlaceId: placeDetails.placeId,
                googleRating: placeDetails.rating,
                googleUserRatingsTotal: placeDetails.userRatingsTotal,
                googleWeekdayText: placeDetails.weekdayText,
                googlePriceLevel: placeDetails.priceLevel,
                googlePlaceUrl: placeDetails.url,
                googleLastFetchedAt: new Date(),
                ...(placeDetails.lat &&
                  placeDetails.lng && {
                    latitude: placeDetails.lat,
                    longitude: placeDetails.lng,
                  }),
              },
            );

            successCount++;
          } else {
            failedCount++;
          }
        }

        await this.delay(100);
      } catch (error) {
        this.logger.error(`Error updating location ${hash}: ${error.message}`);
        failedCount++;
      }
    }

    return { success: successCount, failed: failedCount };
  }

  /**
   * Atualizar todas as locations pendentes (nunca atualizadas)
   */
  async updateAllPending(): Promise<{
    total: number;
    success: number;
    failed: number;
  }> {
    const pendingLocations = await this.locationRepository.find({
      where: {
        geocodingStatus: 'success',
        googleLastFetchedAt: IsNull(),
      },
      relations: ['providers'],
      take: 500, // Limite de segurança
    });

    let successCount = 0;
    let failedCount = 0;

    for (const location of pendingLocations) {
      if (!location.providers || location.providers.length === 0) {
        failedCount++;
        continue;
      }

      try {
        const providerName = location.providers[0].name;

        const placeDetails = await this.googlePlacesService.searchPlace(
          providerName,
          location.fullAddress,
        );

        if (placeDetails) {
          await this.locationRepository.update(
            { hash: location.hash },
            {
              googlePlaceId: placeDetails.placeId,
              googleRating: placeDetails.rating,
              googleUserRatingsTotal: placeDetails.userRatingsTotal,
              googleWeekdayText: placeDetails.weekdayText,
              googlePriceLevel: placeDetails.priceLevel,
              googlePlaceUrl: placeDetails.url,
              googleLastFetchedAt: new Date(),
              ...(placeDetails.lat &&
                placeDetails.lng && {
                  latitude: placeDetails.lat,
                  longitude: placeDetails.lng,
                }),
            },
          );

          successCount++;
        } else {
          await this.locationRepository.update(
            { hash: location.hash },
            {
              googleLastFetchedAt: new Date(),
            },
          );
          failedCount++;
        }

        await this.delay(100);
      } catch (error) {
        this.logger.error(
          `Error updating location ${location.hash}: ${error.message}`,
        );
        failedCount++;
      }
    }

    return {
      total: pendingLocations.length,
      success: successCount,
      failed: failedCount,
    };
  }

  /**
   * Obter estatísticas de atualização do Google Places
   */
  async getUpdateStats(): Promise<{
    total: number;
    updated: number;
    pending: number;
    withRating: number;
    withOpeningHours: number;
  }> {
    const [
      total,
      updated,
      pending,
      withRating,
      withOpeningHours,
    ] = await Promise.all([
      this.locationRepository.count({
        where: { geocodingStatus: 'success' },
      }),
      this.locationRepository.count({
        where: { googleLastFetchedAt: IsNull() as any },
      }),
      this.locationRepository.count({
        where: { googleLastFetchedAt: IsNull() },
      }),
      this.locationRepository.count({
        where: { googleRating: IsNull() as any },
      }),
      this.locationRepository
        .createQueryBuilder('location')
        .where('location.googleWeekdayText IS NOT NULL')
        .getCount(),
    ]);

    return {
      total,
      updated: total - pending,
      pending,
      withRating: total - withRating,
      withOpeningHours,
    };
  }

  /**
   * Delay helper para rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
