import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProviderEntity } from '../../infrastructure/entities/provider.entity';
import { LocationEntity } from '../../infrastructure/entities/location.entity';
import { ServiceEntity } from '../../infrastructure/entities/service.entity';
import { ProviderMetricsEntity } from '../../infrastructure/entities/provider-metrics.entity';
import { QueryProvidersDto } from '../dto/query-providers.dto';
import { QueryPlansDto } from '../dto/query-plans.dto';
import { ProvidersListResponseDto } from '../dto/providers-list-response.dto';
import { ProviderResponseDto } from '../dto/provider-response.dto';
import { NearbyProviderResponseDto } from '../dto/nearby-provider-response.dto';
import { NearbyProvidersListResponseDto } from '../dto/nearby-providers-list-response.dto';

@Injectable()
export class QueryProvidersService {
  constructor(
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>,
    @InjectRepository(LocationEntity)
    private readonly locationRepository: Repository<LocationEntity>,
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
    @InjectRepository(ProviderMetricsEntity)
    private readonly metricsRepository: Repository<ProviderMetricsEntity>,
  ) {}

  async findAll(query: QueryProvidersDto): Promise<ProvidersListResponseDto> {
    const {
      state,
      city,
      neighborhood,
      providerName,
      planName,
      category,
      specialty,
      search,
      page = 1,
      limit = 50,
    } = query;

    const queryBuilder = this.providerRepository
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.location', 'location')
      .leftJoinAndSelect('provider.services', 'service');

    // Filtros
    if (state) {
      queryBuilder.andWhere('UPPER(location.state) = UPPER(:state)', { state });
    }

    if (city) {
      queryBuilder.andWhere('UPPER(location.city) = UPPER(:city)', { city });
    }

    if (neighborhood) {
      queryBuilder.andWhere(
        'UPPER(location.neighborhood) = UPPER(:neighborhood)',
        { neighborhood },
      );
    }

    if (providerName) {
      queryBuilder.andWhere(
        'UPPER(provider.insurance_company) LIKE UPPER(:providerName)',
        {
          providerName: `%${providerName}%`,
        },
      );
    }

    if (planName) {
      queryBuilder.andWhere(
        'UPPER(provider.networkName) LIKE UPPER(:planName)',
        {
          planName: `%${planName}%`,
        },
      );
    }

    if (category) {
      queryBuilder.andWhere('UPPER(service.category) LIKE UPPER(:category)', {
        category: `%${category}%`,
      });
    }

    if (specialty) {
      queryBuilder.andWhere('UPPER(service.specialty) LIKE UPPER(:specialty)', {
        specialty: `%${specialty}%`,
      });
    }

    if (search) {
      queryBuilder.andWhere('UPPER(provider.name) LIKE UPPER(:search)', {
        search: `%${search}%`,
      });
    }

    // Paginação
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Ordenação
    queryBuilder.orderBy('provider.name', 'ASC');

    const [providers, total] = await queryBuilder.getManyAndCount();

    const data = providers.map((provider) => this.mapToResponse(provider));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<ProviderResponseDto | null> {
    const provider = await this.providerRepository.findOne({
      where: { id },
      relations: ['location', 'services'],
    });

    if (!provider) {
      return null;
    }

    return this.mapToResponse(provider);
  }

  async getStates(providerName?: string, planName?: string): Promise<string[]> {
    const queryBuilder = this.locationRepository
      .createQueryBuilder('location')
      .select('DISTINCT UPPER(location.state)', 'state');

    if (providerName || planName) {
      queryBuilder.innerJoin(
        'providers',
        'provider',
        'provider.location_hash = location.hash',
      );

      if (providerName) {
        queryBuilder.andWhere(
          'UPPER(provider.insurance_company) LIKE UPPER(:providerName)',
          {
            providerName: `%${providerName}%`,
          },
        );
      }

      if (planName) {
        queryBuilder.andWhere(
          'UPPER(provider.networkName) LIKE UPPER(:planName)',
          {
            planName: `%${planName}%`,
          },
        );
      }
    }

    queryBuilder.orderBy('state', 'ASC');

    const result = await queryBuilder.getRawMany();
    return result.map((r) => r.state);
  }

  async getCitiesByState(
    state: string,
    providerName?: string,
    planName?: string,
  ): Promise<string[]> {
    const queryBuilder = this.locationRepository
      .createQueryBuilder('location')
      .select('DISTINCT location.city', 'city')
      .where('UPPER(location.state) = UPPER(:state)', { state });

    if (providerName || planName) {
      queryBuilder.innerJoin(
        'providers',
        'provider',
        'provider.location_hash = location.hash',
      );

      if (providerName) {
        queryBuilder.andWhere(
          'UPPER(provider.insurance_company) LIKE UPPER(:providerName)',
          {
            providerName: `%${providerName}%`,
          },
        );
      }

      if (planName) {
        queryBuilder.andWhere(
          'UPPER(provider.networkName) LIKE UPPER(:planName)',
          {
            planName: `%${planName}%`,
          },
        );
      }
    }

    queryBuilder.orderBy('city', 'ASC');

    const result = await queryBuilder.getRawMany();
    return result.map((r) => r.city);
  }

  async getNeighborhoodsByCity(
    state: string,
    city: string,
    providerName?: string,
    planName?: string,
  ): Promise<string[]> {
    const queryBuilder = this.locationRepository
      .createQueryBuilder('location')
      .select('DISTINCT location.neighborhood', 'neighborhood')
      .where('UPPER(location.state) = UPPER(:state)', { state })
      .andWhere('UPPER(location.city) = UPPER(:city)', { city })
      .andWhere('location.neighborhood IS NOT NULL')
      .andWhere('location.neighborhood != :empty', { empty: '' });

    if (providerName || planName) {
      queryBuilder.innerJoin(
        'providers',
        'provider',
        'provider.location_hash = location.hash',
      );

      if (providerName) {
        queryBuilder.andWhere(
          'UPPER(provider.insurance_company) LIKE UPPER(:providerName)',
          {
            providerName: `%${providerName}%`,
          },
        );
      }

      if (planName) {
        queryBuilder.andWhere(
          'UPPER(provider.networkName) LIKE UPPER(:planName)',
          {
            planName: `%${planName}%`,
          },
        );
      }
    }

    queryBuilder.orderBy('neighborhood', 'ASC');

    const result = await queryBuilder.getRawMany();
    return result.map((r) => r.neighborhood);
  }

  async getCategories(
    state?: string,
    city?: string,
    neighborhood?: string,
    providerName?: string,
    planName?: string,
  ): Promise<string[]> {
    const queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .select('DISTINCT service.category', 'category');

    // Adiciona joins apenas se houver filtros
    if (state || city || neighborhood || providerName || planName) {
      queryBuilder
        .innerJoin('service.provider', 'provider')
        .innerJoin('provider.location', 'location');

      if (state) {
        queryBuilder.andWhere('UPPER(location.state) = UPPER(:state)', {
          state,
        });
      }

      if (city) {
        queryBuilder.andWhere('UPPER(location.city) = UPPER(:city)', { city });
      }

      if (neighborhood) {
        queryBuilder.andWhere(
          'UPPER(location.neighborhood) = UPPER(:neighborhood)',
          { neighborhood },
        );
      }

      if (providerName) {
        queryBuilder.andWhere(
          'UPPER(provider.insurance_company) LIKE UPPER(:providerName)',
          {
            providerName: `%${providerName}%`,
          },
        );
      }

      if (planName) {
        queryBuilder.andWhere(
          'UPPER(provider.networkName) LIKE UPPER(:planName)',
          {
            planName: `%${planName}%`,
          },
        );
      }
    }

    queryBuilder.orderBy('category', 'ASC');

    const result = await queryBuilder.getRawMany();
    return result.map((r) => r.category);
  }

  async getSpecialties(
    state?: string,
    city?: string,
    neighborhood?: string,
    providerName?: string,
    planName?: string,
    category?: string,
  ): Promise<string[]> {
    const queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .select('DISTINCT service.specialty', 'specialty');

    // Adiciona joins apenas se houver filtros
    if (state || city || neighborhood || providerName || planName || category) {
      queryBuilder.innerJoin('service.provider', 'provider');

      if (state || city || neighborhood) {
        queryBuilder.innerJoin('provider.location', 'location');

        if (state) {
          queryBuilder.andWhere('UPPER(location.state) = UPPER(:state)', {
            state,
          });
        }

        if (city) {
          queryBuilder.andWhere('UPPER(location.city) = UPPER(:city)', {
            city,
          });
        }

        if (neighborhood) {
          queryBuilder.andWhere(
            'UPPER(location.neighborhood) = UPPER(:neighborhood)',
            { neighborhood },
          );
        }
      }

      if (providerName) {
        queryBuilder.andWhere(
          'UPPER(provider.insurance_company) LIKE UPPER(:providerName)',
          {
            providerName: `%${providerName}%`,
          },
        );
      }

      if (planName) {
        queryBuilder.andWhere(
          'UPPER(provider.networkName) LIKE UPPER(:planName)',
          {
            planName: `%${planName}%`,
          },
        );
      }

      if (category) {
        queryBuilder.andWhere('UPPER(service.category) LIKE UPPER(:category)', {
          category: `%${category}%`,
        });
      }
    }

    queryBuilder.orderBy('specialty', 'ASC');

    const result = await queryBuilder.getRawMany();
    return result.map((r) => r.specialty);
  }

  async getStats(): Promise<{
    totalProviders: number;
    totalLocations: number;
    totalServices: number;
    totalStates: number;
    totalCities: number;
  }> {
    const [totalProviders, totalLocations, totalServices] = await Promise.all([
      this.providerRepository.count(),
      this.locationRepository.count(),
      this.serviceRepository.count(),
    ]);

    const states = await this.getStates();
    const cities = await this.locationRepository
      .createQueryBuilder('location')
      .select('DISTINCT location.city', 'city')
      .getRawMany();

    return {
      totalProviders,
      totalLocations,
      totalServices,
      totalStates: states.length,
      totalCities: cities.length,
    };
  }

  private mapToResponse(provider: ProviderEntity): ProviderResponseDto {
    const location = provider.location;
    const phone = provider.phone1
      ? `${provider.phone1AreaCode ? '(' + provider.phone1AreaCode + ') ' : ''}${provider.phone1}`
      : undefined;

    return {
      id: provider.id,
      name: provider.name,
      category: provider.insuranceCompany,
      address: this.formatAddress(location),
      addressComplement: location?.complement,
      neighborhood: location?.neighborhood || '',
      city: location?.city || '',
      state: location?.state || '',
      zipCode: location?.postalCode || '',
      phone,
      location: location
        ? {
            hash: location.hash,
            latitude: location.latitude ? Number(location.latitude) : undefined,
            longitude: location.longitude
              ? Number(location.longitude)
              : undefined,
            formattedAddress: this.formatAddress(location),
            googleRating: location.googleRating
              ? Number(location.googleRating)
              : undefined,
            googleUserRatingsTotal: location.googleUserRatingsTotal,
            googleWeekdayText: location.googleWeekdayText,
            googlePlaceUrl: location.googlePlaceUrl,
          }
        : undefined,
      services:
        provider.services?.map((service) => ({
          id: service.id,
          specialty: service.specialty,
        })) || [],
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }

  async searchNearbyProviders(
    latitude: number,
    longitude: number,
    providerName?: string,
    searchText?: string,
    planName?: string,
    distanceKm: number = 5,
    limit: number = 20,
    page: number = 1,
  ): Promise<NearbyProvidersListResponseDto> {
    // ============================================================================
    // ETAPA 1: CALCULAR BOUNDING BOX (Otimização de Performance)
    // ============================================================================
    // Em vez de calcular Haversine para TODAS as clínicas do banco, primeiro
    // filtramos aquelas que estão em um retângulo aproximado ao redor do ponto.
    // Isso melhora drasticamente a performance reduzindo o número de cálculos.

    const earthRadiusKm = 6371; // Raio da Terra em km

    // Calcula a variação de latitude em graus
    // latChange = (distância / raio) × (180 / π)
    // Quanto maior a distância, maior a variação de latitude
    const latChange = (distanceKm / earthRadiusKm) * (180 / Math.PI);

    // Calcula a variação de longitude em graus
    // A longitude precisa de ajuste adicional: divide por cos(latitude)
    // Isso é necessário porque as linhas de longitude se aproximam nos polos
    const lonChange =
      ((distanceKm / earthRadiusKm) * (180 / Math.PI)) /
      Math.cos((latitude * Math.PI) / 180);

    // Define os limites do retângulo (bounding box)
    const minLat = latitude - latChange;
    const maxLat = latitude + latChange;
    const minLon = longitude - lonChange;
    const maxLon = longitude + lonChange;

    // ============================================================================
    // ETAPA 2: CONSULTAR BANCO DE DADOS COM FILTRO DE BOUNDING BOX
    // ============================================================================
    const queryBuilder = this.providerRepository
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.location', 'location')
      .leftJoinAndSelect('provider.services', 'service')
      .leftJoinAndSelect(
        ProviderMetricsEntity,
        'metrics',
        'metrics.provider_id = provider.id',
      )
      .where('location.latitude IS NOT NULL')
      .andWhere('location.longitude IS NOT NULL')
      .andWhere('location.latitude BETWEEN :minLat AND :maxLat', {
        minLat,
        maxLat,
      })
      .andWhere('location.longitude BETWEEN :minLon AND :maxLon', {
        minLon,
        maxLon,
      })
      .setParameters({ minLat, maxLat, minLon, maxLon });

    // Aplicar filtros opcionais
    if (providerName) {
      queryBuilder.andWhere(
        'UPPER(provider.insurance_company) LIKE UPPER(:providerName)',
        {
          providerName: `%${providerName}%`,
        },
      );
    }

    if (planName) {
      queryBuilder.andWhere(
        'UPPER(provider.networkName) LIKE UPPER(:planName)',
        {
          planName: `%${planName}%`,
        },
      );
    }

    if (searchText) {
      queryBuilder.andWhere(
        '(UPPER(provider.name) LIKE UPPER(:searchText) OR UPPER(service.specialty) LIKE UPPER(:searchText))',
        { searchText: `%${searchText}%` },
      );
    }

    // Busca mais resultados que o necessário para garantir precisão após
    // o cálculo exato de Haversine e filtragem de distância
    const providers = await queryBuilder.take(limit * 3).getMany();

    // Busca as métricas para cada provider
    const providerIds = providers.map((p) => p.id);
    const metricsMap = new Map<string, ProviderMetricsEntity>();

    if (providerIds.length > 0) {
      const metrics = await this.metricsRepository.find({
        where: { providerId: In(providerIds) },
      });
      metrics.forEach((m) => metricsMap.set(m.providerId, m));
    }

    // ============================================================================
    // ETAPA 3: CALCULAR DISTÂNCIA EXATA COM HAVERSINE E FILTRAR
    // ============================================================================
    // Agora calcula a distância real (Haversine) apenas para os candidatos
    // do bounding box, eliminando falsos positivos do retângulo aproximado.

    const providersWithDistance = providers
      .map((provider) => {
        // Validar que location possui coordenadas válidas
        if (!provider.location?.latitude || !provider.location?.longitude) {
          return null;
        }

        // Calcula a distância exata usando Haversine
        const distance = this.calculateDistance(
          latitude,
          longitude,
          Number(provider.location.latitude),
          Number(provider.location.longitude),
        );

        // Remove clínicas que estão além do raio especificado
        // (falsos positivos do bounding box circular)
        if (distance > distanceKm) {
          return null;
        }

        const metrics = metricsMap.get(provider.id);

        return {
          provider,
          distance,
          avgClaimValue: metrics ? Number(metrics.avgClaimValue) : 0,
        };
      })
      .filter((item) => item !== null)
      // Ordena por: 1) média de claims (menor), 2) googleRating (maior), 3) distância (menor)
      // Se um dos valores for 0 (sem métrica), pula para próxima ordenação
      .sort((a, b) => {
        const aHasMetrics = a!.avgClaimValue > 0;
        const bHasMetrics = b!.avgClaimValue > 0;

        // Se ambos têm métricas válidas, comparar por média
        if (aHasMetrics && bHasMetrics) {
          const avgDiff = a!.avgClaimValue - b!.avgClaimValue;
          if (avgDiff !== 0) {
            return avgDiff;
          }
        }

        // Se só um tem métrica, priorizar o que tem métricas
        if (aHasMetrics !== bHasMetrics) {
          return aHasMetrics ? -1 : 1;
        }

        // Se métricas são iguais ou ambos sem métricas, ordenar por Google Rating (maior primeiro)
        const aRating = a!.provider.location?.googleRating
          ? Number(a!.provider.location.googleRating)
          : 0;
        const bRating = b!.provider.location?.googleRating
          ? Number(b!.provider.location.googleRating)
          : 0;

        if (aRating !== bRating) {
          return bRating - aRating; // Ordem decrescente (maior rating primeiro)
        }

        // Se ratings são iguais, ordenar por distância
        return a!.distance - b!.distance;
      });

    // ============================================================================
    // ETAPA 4: APLICAR PAGINAÇÃO
    // ============================================================================
    const total = providersWithDistance.length; // Total de resultados encontrados
    const skip = (page - 1) * limit; // Calcula quantos registros pular
    const paginatedProviders = providersWithDistance.slice(skip, skip + limit);

    // Converte para o DTO de resposta incluindo a distância formatada e média de claims
    const data = paginatedProviders.map((item) =>
      this.mapToNearbyResponse(
        item!.provider,
        item!.distance,
        item!.avgClaimValue,
      ),
    );

    return {
      data,
      count: data.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private mapToNearbyResponse(
    provider: ProviderEntity,
    distance: number,
    avgClaimValue: number,
  ): NearbyProviderResponseDto {
    const location = provider.location;
    const phone1 = provider.phone1
      ? `${provider.phone1AreaCode ? '(' + provider.phone1AreaCode + ') ' : ''}${provider.phone1}`
      : undefined;
    const phone2 = provider.phone2
      ? `${provider.phone2AreaCode ? '(' + provider.phone2AreaCode + ') ' : ''}${provider.phone2}`
      : undefined;
    const whatsapp = provider.whatsapp
      ? `${provider.whatsappAreaCode ? '(' + provider.whatsappAreaCode + ') ' : ''}${provider.whatsapp}`
      : undefined;

    return {
      id: provider.id,
      name: provider.name,
      address: this.formatAddress(location),
      neighborhood: location?.neighborhood,
      city: location?.city || '',
      state: location?.state || '',
      zipCode: location?.postalCode || '',
      phone: phone1,
      phone2,
      whatsapp,
      specialty: provider.services?.map((s) => s.specialty) || [],
      distance: Number(distance.toFixed(2)),
      latitude: location?.latitude ? Number(location.latitude) : undefined,
      longitude: location?.longitude ? Number(location.longitude) : undefined,
      googleRating: location?.googleRating
        ? Number(location.googleRating)
        : undefined,
      googleUserRatingsTotal: location?.googleUserRatingsTotal,
      googleWeekdayText: location?.googleWeekdayText,
      googlePlaceUrl: location?.googlePlaceUrl,
    };
  }

  /**
   * Formata o endereço no padrão brasileiro - Rua, Logradouro, Número e Complemento.
   * Exemplo: Av. Conselheiro Rodrigues Alves, 180, Apto 5
   *
   * @param location - Objeto com os dados da localização
   * @returns Endereço formatado
   */
  private formatAddress(location?: LocationEntity): string {
    if (!location || !location.streetName) {
      return '';
    }

    let address = '';

    // Adiciona Tipo (Rua, Av., etc)
    if (location.streetType) {
      address = location.streetType;
    }

    // Adiciona Logradouro (nome da rua)
    if (address) {
      address += ` ${location.streetName}`;
    } else {
      address = location.streetName;
    }

    // Adiciona Número
    if (location.streetNumber) {
      address += `, ${location.streetNumber}`;
    }

    // Adiciona Complemento
    if (location.complement) {
      address += `, ${location.complement}`;
    }

    return address;
  }

  /**
   * Calcula a distância entre dois pontos geográficos usando o algoritmo de Haversine.
   * Este algoritmo considera a curvatura da Terra e é mais preciso que cálculos euclidianos.
   *
   * @param lat1 - Latitude do ponto de origem (usuário)
   * @param lon1 - Longitude do ponto de origem (usuário)
   * @param lat2 - Latitude do ponto de destino (clínica)
   * @param lon2 - Longitude do ponto de destino (clínica)
   * @returns Distância em quilômetros
   *
   * Fórmula de Haversine:
   * a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
   * c = 2 × atan2(√a, √(1−a))
   * d = R × c
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    // Raio médio da Terra em quilômetros
    const R = 6371;

    // Converte as diferenças de latitude e longitude para radianos
    // Multiplica por π/180 para converter de graus para radianos
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    // Primeira parte da fórmula de Haversine: sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
    // Calcula o valor 'a' que representa a metade da corda entre os dois pontos
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    // Segunda parte da fórmula: 2 × atan2(√a, √(1−a))
    // Calcula o ângulo central (c) em radianos
    // atan2 é mais estável numericamente que outras funções trigonométricas
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Multiplica o ângulo central (em radianos) pelo raio da Terra
    // Resultado final é a distância em quilômetros
    return R * c;
  }

  async getPlans(query: QueryPlansDto): Promise<
    {
      plan: string;
    }[]
  > {
    const queryBuilder = this.providerRepository
      .createQueryBuilder('provider')
      .select('provider.networkName', 'networkName')
      .distinct(true);

    if (query.providerName) {
      queryBuilder.where(
        'UPPER(provider.insuranceCompany) LIKE UPPER(:insuranceCompany)',
        {
          insuranceCompany: `%${query.providerName}%`,
        },
      );
    }

    queryBuilder.orderBy('provider.networkName', 'ASC');

    const result = await queryBuilder.getRawMany();

    return result.map((r) => ({
      plan: r.networkName.toUpperCase(),
    }));
  }
}
