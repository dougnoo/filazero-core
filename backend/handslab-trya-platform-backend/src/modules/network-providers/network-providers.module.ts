import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { LocationEntity } from './infrastructure/entities/location.entity';
import { ProviderEntity } from './infrastructure/entities/provider.entity';
import { ServiceEntity } from './infrastructure/entities/service.entity';
import { ImportEntity } from './infrastructure/entities/import.entity';
import { HealthcareClaimEntity } from './infrastructure/entities/healthcare-claim.entity';
import { ProviderMetricsEntity } from './infrastructure/entities/provider-metrics.entity';
import { ProviderNameMappingEntity } from './infrastructure/entities/provider-name-mapping.entity';
import { ImportProvidersService } from './application/services/import-providers.service';
import { QueryProvidersService } from './application/services/query-providers.service';
import { GeocodingService } from './application/services/geocoding.service';
import { GooglePlacesService } from './application/services/google-places.service';
import { PlacesUpdateService } from './application/services/places-update.service';
import { ClaimsImportService } from './application/services/claims-import.service';
import { ClaimsAnalyticsService } from './application/services/claims-analytics.service';
import { ProviderMatchingService } from './application/services/provider-matching.service';
import { NetworkProvidersController } from './presentation/controllers/network-providers.controller';
import { BatchOperationRepository } from './infrastructure/repositories/batch-operation.repository';
import { S3Service } from '../../shared/infrastructure/services/s3.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LocationEntity,
      ProviderEntity,
      ServiceEntity,
      ImportEntity,
      HealthcareClaimEntity,
      ProviderMetricsEntity,
      ProviderNameMappingEntity,
    ]),
    ScheduleModule.forRoot(),
    HttpModule, // Para a nova Google Places API
    UsersModule, // Para acessar USER_DB_REPOSITORY_TOKEN
  ],
  controllers: [NetworkProvidersController],
  providers: [
    ImportProvidersService,
    QueryProvidersService,
    GeocodingService,
    GooglePlacesService,
    PlacesUpdateService,
    ClaimsImportService,
    ClaimsAnalyticsService,
    ProviderMatchingService,
    BatchOperationRepository,
    S3Service,
  ],
  exports: [
    ImportProvidersService,
    QueryProvidersService,
    GeocodingService,
    GooglePlacesService,
    PlacesUpdateService,
    ClaimsImportService,
    ClaimsAnalyticsService,
    ProviderMatchingService,
    BatchOperationRepository,
  ],
})
export class NetworkProvidersModule {}
