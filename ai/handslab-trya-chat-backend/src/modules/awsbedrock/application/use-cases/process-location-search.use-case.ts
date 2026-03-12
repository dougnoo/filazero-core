import { Injectable, Logger } from '@nestjs/common';
import { LocationService } from '@modules/location/location.service';
import { GeocodingService } from '@modules/location/geocoding.service';
import { HealthcareFacilitiesService, HealthcareFacilityFromIA } from '@modules/healthcare-facilities';

interface LocationSearchParams {
  locais?: HealthcareFacilityFromIA[];
  latitude?: string | number;
  longitude?: string | number;
  lon?: string | number;
  lng?: string | number;
  lat?: string | number;
  endereco?: string;
  address?: string;
  limit?: string | number;
  max?: string | number;
  radius?: string | number;
  raio?: string | number;
  tipo?: string;
  emergencia?: string | boolean;
  especialidade?: string;
}

interface LocationSearchResult {
  status: string;
  total_encontrados?: number;
  total_geocodificados?: number;
  localizacao_usuario?: {
    latitude: number;
    longitude: number;
  };
  raio_busca_km?: number;
  locais?: any[];
  message?: string;
  error?: string;
  locais_nao_geocodificados?: any[];
  timestamp: string;
}

/**
 * Use Case: Processar Busca de Locais de Atendimento
 * 
 * Responsabilidade: Coordenar a busca de locais, geocoding e ordenação por proximidade
 * Camada: Application (Clean Architecture)
 */
@Injectable()
export class ProcessLocationSearchUseCase {
  private readonly logger = new Logger(ProcessLocationSearchUseCase.name);

  constructor(
    private readonly locationService: LocationService,
    private readonly geocodingService: GeocodingService,
    private readonly healthcareFacilitiesService: HealthcareFacilitiesService,
  ) {}

  /**
   * Executa a busca de locais
   * 
   * @param params Parâmetros extraídos do Bedrock Agent
   * @returns Resultado da busca com locais ordenados por proximidade
   */
  async execute(params: LocationSearchParams): Promise<LocationSearchResult> {
    this.logger.log('🗺️ Iniciando busca de locais');
    this.logger.debug('Parâmetros recebidos:', params);

    const maxResults = parseInt(String(params.limit || params.max || '5'), 10);
    const radiusKm = parseFloat(String(params.radius || params.raio || '50'));

    // CASO 1: Endereços vêm da IA (fluxo principal com geocoding)
    if (params.locais && Array.isArray(params.locais)) {
      this.logger.log('🤖 Processando endereços vindos da IA Bedrock');
      return await this.processLocationsFromIA(params.locais, {
        userLatitude: params.latitude || params.lat,
        userLongitude: params.longitude || params.lng || params.lon,
        userAddress: params.endereco || params.address,
        maxResults,
        radiusKm,
      });
    }

    // CASO 2: Buscar locais cadastrados (fallback)
    return await this.processRegisteredLocations(params, maxResults, radiusKm);
  }

  /**
   * Processa busca quando os endereços vêm da IA do Bedrock
   * Este é o fluxo principal que usa geocoding
   */
  private async processLocationsFromIA(
    locaisIA: HealthcareFacilityFromIA[],
    options: {
      userLatitude?: string | number;
      userLongitude?: string | number;
      userAddress?: string;
      maxResults: number;
      radiusKm: number;
    },
  ): Promise<LocationSearchResult> {
    this.logger.log(`🤖 Processando ${locaisIA.length} endereços da IA...`);

    // 1. Converter endereços da IA em locais com coordenadas (via geocoding)
    const facilities = await this.healthcareFacilitiesService.convertAddressesToFacilities(locaisIA);

    // Filtrar apenas os que conseguiram ser geocodificados
    const facilitiesWithCoords = facilities.filter((f) => f.coordinates);
    this.logger.log(`✅ ${facilitiesWithCoords.length}/${facilities.length} endereços geocodificados com sucesso`);

    if (facilitiesWithCoords.length === 0) {
      this.logger.warn('⚠️ Nenhum endereço pôde ser geocodificado');
      return {
        status: 'ERRO',
        message: 'Não foi possível geocodificar os endereços fornecidos',
        locais_nao_geocodificados: facilities.map((f) => ({
          nome: f.nome,
          endereco: f.endereco,
        })),
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Determinar localização do usuário
    const userLocation = await this.determineUserLocation(
      options.userLatitude,
      options.userLongitude,
      options.userAddress,
    );

    this.logger.log(`📍 Localização do usuário: ${userLocation.latitude}, ${userLocation.longitude}`);

    // 3. Calcular distâncias e ordenar
    const nearestLocations = this.locationService.findNearestLocations(
      userLocation,
      facilitiesWithCoords,
      options.maxResults * 2,
    );

    // 4. Filtrar por raio
    const locationsInRadius = this.locationService.filterByRadius(
      userLocation,
      nearestLocations,
      options.radiusKm,
    );

    // 5. Limitar resultados
    const finalResults = locationsInRadius.slice(0, options.maxResults);

    this.logger.log(`✅ Retornando ${finalResults.length} locais ordenados por proximidade`);

    // 6. Retornar resultado formatado
    return {
      status: 'LOCAIS_ENCONTRADOS',
      total_encontrados: finalResults.length,
      total_geocodificados: facilitiesWithCoords.length,
      localizacao_usuario: userLocation,
      raio_busca_km: options.radiusKm,
      locais: finalResults.map((local) => ({
        nome: local.nome,
        tipo: local.tipo,
        endereco: local.endereco,
        distancia: local.distanciaFormatada,
        distancia_km: local.distanciaKm,
        telefone: local.telefone,
        especialidades: local.especialidades?.join(', '),
        funcionamento: local.funcionamento,
        coordinates: local.coordinates,
      })),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Processa busca usando locais cadastrados (sem IA)
   * Fallback quando não há lista de locais da IA
   */
  private async processRegisteredLocations(
    params: LocationSearchParams,
    maxResults: number,
    radiusKm: number,
  ): Promise<LocationSearchResult> {
    this.logger.log('📊 Buscando locais cadastrados');

    // Determinar localização do usuário
    const userLocation = await this.determineUserLocation(
      params.latitude || params.lat,
      params.longitude || params.lng || params.lon,
      params.endereco || params.address,
    );

    this.logger.log(`🔍 Buscando até ${maxResults} locais em um raio de ${radiusKm}km`);

    try {
      // Buscar locais de atendimento cadastrados
      const criteria: any = {};
      if (params.tipo) criteria.tipo = params.tipo;
      if (params.emergencia !== undefined) {
        criteria.emergencia = params.emergencia === 'true' || params.emergencia === true;
      }
      if (params.especialidade) criteria.especialidade = params.especialidade;

      let facilities = await this.healthcareFacilitiesService.filterFacilities(criteria);

      if (facilities.length === 0) {
        facilities = await this.healthcareFacilitiesService.findAll();
      }

      // Filtrar apenas locais com coordenadas
      facilities = facilities.filter((f) => f.coordinates);
      this.logger.log(`📊 Total de locais com coordenadas: ${facilities.length}`);

      // Calcular distâncias e ordenar por proximidade
      const nearestLocations = this.locationService.findNearestLocations(
        userLocation,
        facilities,
        maxResults * 2,
      );

      // Filtrar por raio
      const locationsInRadius = this.locationService.filterByRadius(userLocation, nearestLocations, radiusKm);

      // Limitar ao número máximo de resultados
      const finalResults = locationsInRadius.slice(0, maxResults);

      this.logger.log(`✅ Retornando ${finalResults.length} locais dentro do raio de ${radiusKm}km`);

      return {
        status: 'LOCAIS_ENCONTRADOS',
        total_encontrados: finalResults.length,
        localizacao_usuario: userLocation,
        raio_busca_km: radiusKm,
        locais: finalResults.map((local) => ({
          nome: local.nome,
          tipo: local.tipo,
          endereco: local.endereco,
          distancia: local.distanciaFormatada,
          distancia_km: local.distanciaKm,
          telefone: local.telefone,
          especialidades: local.especialidades?.join(', '),
          funcionamento: local.funcionamento,
        })),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('❌ Erro ao buscar locais:', error);
      return {
        status: 'ERRO',
        message: 'Erro ao buscar locais de atendimento',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Determina a localização do usuário a partir de diferentes fontes
   * 
   * @returns Coordenadas do usuário ou localização padrão
   */
  private async determineUserLocation(
    latitude?: string | number,
    longitude?: string | number,
    address?: string,
  ): Promise<{ latitude: number; longitude: number }> {
    // Tentar usar coordenadas fornecidas
    if (latitude && longitude) {
      const lat = parseFloat(String(latitude));
      const lng = parseFloat(String(longitude));

      if (this.locationService.validateCoordinates({ latitude: lat, longitude: lng })) {
        this.logger.debug(`Usando coordenadas fornecidas: ${lat}, ${lng}`);
        return { latitude: lat, longitude: lng };
      }
    }

    // Tentar geocodificar endereço do usuário
    if (address) {
      this.logger.log(`📍 Geocodificando endereço do usuário: ${address}`);
      const geocoded = await this.geocodingService.geocodeAddress(address);

      if (geocoded) {
        this.logger.log(`✅ Endereço geocodificado: ${geocoded.latitude}, ${geocoded.longitude}`);
        return { latitude: geocoded.latitude, longitude: geocoded.longitude };
      }
    }

    // Usar localização padrão (Centro de São Paulo)
    this.logger.warn('⚠️ Usando localização padrão (Centro de São Paulo)');
    return { latitude: -23.5505, longitude: -46.6333 };
  }
}

