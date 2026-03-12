import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkProvidersController } from './presentation/network-providers.controller';
import { AuthModule } from '../auth/auth.module';
import { GetPlansUseCase } from './application/use-cases/get-plans.use-case';
import { SearchByCpfUseCase } from './application/use-cases/search-by-cpf.use-case';
import { GetStatesUseCase } from './application/use-cases/get-states.use-case';
import { GetMunicipalitiesUseCase } from './application/use-cases/get-municipalities.use-case';
import { GetNeighborhoodsUseCase } from './application/use-cases/get-neighborhoods.use-case';
import { GetServiceTypesUseCase } from './application/use-cases/get-service-types.use-case';
import { GetSpecialtiesUseCase } from './application/use-cases/get-specialties.use-case';
import { SearchProvidersUseCase } from './application/use-cases/search-providers.use-case';
import { SearchProvidersInstitucionalUseCase } from './application/use-cases/search-providers-institucional.use-case';
import { SearchProvidersHybridUseCase } from './application/use-cases/search-providers-hybrid.use-case';
import { SearchNearbyProvidersUseCase } from './application/use-cases/search-nearby-providers.use-case';
import { SearchByChatUseCase } from './application/use-cases/search-by-chat.use-case';
import { HtmlParserService } from './infrastructure/services/html-parser.service';
import { HttpAmilRepository } from './infrastructure/repositories/http-amil.repository';
import { DbNetworkProviderRepository } from './infrastructure/repositories/db-network-provider.repository';
import { HttpNetworkProviderRepository } from './infrastructure/repositories/http-network-provider.repository';
import { ImportedNetworkRepository } from './infrastructure/repositories/imported-network.repository';
import { BedrockSpecialtyExtractor } from './infrastructure/services/bedrock-specialty-extractor.service';
import { AMIL_REPOSITORY_TOKEN } from './domain/repositories/amil-repository.interface';
import { NETWORK_PROVIDER_REPOSITORY_TOKEN } from './domain/repositories/network-provider.repository.interface';
import { NETWORK_PROVIDER_API_REPOSITORY_TOKEN } from './domain/repositories/network-provider-api.repository.interface';
import { IMPORTED_NETWORK_REPOSITORY_TOKEN } from './domain/repositories/imported-network.repository.interface';
import { SPECIALTY_EXTRACTOR_TOKEN } from './domain/ports/specialty-extractor.interface';
import { User } from '../../database/entities/user.entity';
import { UserPlan } from '../../database/entities/user-plan.entity';
import { HealthPlan } from '../../database/entities/health-plan.entity';
import { HealthOperator } from '../../database/entities/health-operator.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { NetworkProvider } from '../../database/entities/network-provider.entity';
import { NetworkProviderLocation } from '../../database/entities/network-provider-location.entity';
import { NetworkProviderService } from '../../database/entities/network-provider-service.entity';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([
      User,
      UserPlan,
      HealthPlan,
      HealthOperator,
      Tenant,
      NetworkProvider,
      NetworkProviderLocation,
      NetworkProviderService,
    ]),
  ],
  controllers: [NetworkProvidersController],
  providers: [
    HtmlParserService,
    {
      provide: NETWORK_PROVIDER_REPOSITORY_TOKEN,
      useClass: DbNetworkProviderRepository,
    },
    {
      provide: NETWORK_PROVIDER_API_REPOSITORY_TOKEN,
      useClass: HttpNetworkProviderRepository,
    },
    {
      provide: AMIL_REPOSITORY_TOKEN,
      useClass: HttpAmilRepository,
    },
    {
      provide: IMPORTED_NETWORK_REPOSITORY_TOKEN,
      useClass: ImportedNetworkRepository,
    },
    {
      provide: SPECIALTY_EXTRACTOR_TOKEN,
      useClass: BedrockSpecialtyExtractor,
    },
    GetPlansUseCase,
    SearchByCpfUseCase,
    GetStatesUseCase,
    GetMunicipalitiesUseCase,
    GetNeighborhoodsUseCase,
    GetServiceTypesUseCase,
    GetSpecialtiesUseCase,
    SearchProvidersUseCase,
    SearchProvidersInstitucionalUseCase,
    SearchProvidersHybridUseCase,
    SearchNearbyProvidersUseCase,
    SearchByChatUseCase,
  ],
  exports: [
    GetPlansUseCase,
    SearchByCpfUseCase,
    GetStatesUseCase,
    GetMunicipalitiesUseCase,
    GetNeighborhoodsUseCase,
    GetServiceTypesUseCase,
    GetSpecialtiesUseCase,
    SearchProvidersUseCase,
    SearchProvidersInstitucionalUseCase,
    SearchProvidersHybridUseCase,
    IMPORTED_NETWORK_REPOSITORY_TOKEN,
  ],
})
export class NetworkProvidersModule {}
