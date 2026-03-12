import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NetworkProvider } from '../../../../database/entities/network-provider.entity';
import { NetworkProviderLocation } from '../../../../database/entities/network-provider-location.entity';
import { NetworkProviderService } from '../../../../database/entities/network-provider-service.entity';
import {
  IImportedNetworkRepository,
  ImportedProviderSearchParams,
  ImportedProviderResult,
  ImportedFilterOptions,
} from '../../domain/repositories/imported-network.repository.interface';

@Injectable()
export class ImportedNetworkRepository implements IImportedNetworkRepository {
  private readonly logger = new Logger(ImportedNetworkRepository.name);

  constructor(
    @InjectRepository(NetworkProvider)
    private readonly providerRepo: Repository<NetworkProvider>,
    @InjectRepository(NetworkProviderLocation)
    private readonly locationRepo: Repository<NetworkProviderLocation>,
    @InjectRepository(NetworkProviderService)
    private readonly serviceRepo: Repository<NetworkProviderService>,
  ) {}

  async hasImportedNetwork(operatorId: string): Promise<boolean> {
    const count = await this.providerRepo.count({
      where: { operatorId, isActive: true },
    });
    return count > 0;
  }

  async searchProviders(
    params: ImportedProviderSearchParams,
  ): Promise<ImportedProviderResult[]> {
    const qb = this.providerRepo
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.location', 'l')
      .leftJoinAndSelect('p.services', 's')
      .where('p.operator_id = :operatorId', { operatorId: params.operatorId })
      .andWhere('p.is_active = true');

    if (params.state) {
      qb.andWhere('UPPER(l.state) = UPPER(:state)', { state: params.state });
    }

    if (params.city) {
      qb.andWhere('LOWER(l.city) = LOWER(:city)', { city: params.city });
    }

    if (params.neighborhood) {
      qb.andWhere('LOWER(l.neighborhood) = LOWER(:neighborhood)', {
        neighborhood: params.neighborhood,
      });
    }

    if (params.category) {
      qb.andWhere('LOWER(s.category) = LOWER(:category)', {
        category: params.category,
      });
    }

    if (params.specialty) {
      qb.andWhere('LOWER(s.specialty) LIKE LOWER(:specialty)', {
        specialty: `%${params.specialty}%`,
      });
    }

    if (params.planType) {
      qb.andWhere('LOWER(p.plan_type) = LOWER(:planType)', {
        planType: params.planType,
      });
    }

    qb.orderBy('p.name', 'ASC');

    if (params.limit) {
      qb.limit(params.limit);
    }

    if (params.offset) {
      qb.offset(params.offset);
    }

    const providers = await qb.getMany();

    return providers.map((p) => this.mapToResult(p));
  }

  async countProviders(params: ImportedProviderSearchParams): Promise<number> {
    const qb = this.providerRepo
      .createQueryBuilder('p')
      .innerJoin('p.location', 'l')
      .leftJoin('p.services', 's')
      .where('p.operator_id = :operatorId', { operatorId: params.operatorId })
      .andWhere('p.is_active = true');

    if (params.state) {
      qb.andWhere('UPPER(l.state) = UPPER(:state)', { state: params.state });
    }

    if (params.city) {
      qb.andWhere('LOWER(l.city) = LOWER(:city)', { city: params.city });
    }

    if (params.neighborhood) {
      qb.andWhere('LOWER(l.neighborhood) = LOWER(:neighborhood)', {
        neighborhood: params.neighborhood,
      });
    }

    if (params.category) {
      qb.andWhere('LOWER(s.category) = LOWER(:category)', {
        category: params.category,
      });
    }

    if (params.specialty) {
      qb.andWhere('LOWER(s.specialty) LIKE LOWER(:specialty)', {
        specialty: `%${params.specialty}%`,
      });
    }

    if (params.planType) {
      qb.andWhere('LOWER(p.plan_type) = LOWER(:planType)', {
        planType: params.planType,
      });
    }

    return qb.getCount();
  }

  async getFilterOptions(operatorId: string): Promise<ImportedFilterOptions> {
    const [states, categories, specialties] = await Promise.all([
      this.getStates(operatorId),
      this.getCategories(operatorId),
      this.getSpecialties(operatorId),
    ]);

    return {
      states,
      cities: [], // Carregado dinamicamente por estado
      neighborhoods: [], // Carregado dinamicamente por cidade
      categories,
      specialties,
    };
  }

  async getStates(operatorId: string): Promise<string[]> {
    const result = await this.locationRepo
      .createQueryBuilder('l')
      .select('DISTINCT UPPER(l.state)', 'state')
      .innerJoin('l.providers', 'p')
      .where('l.operator_id = :operatorId', { operatorId })
      .andWhere('p.is_active = true')
      .orderBy('state', 'ASC')
      .getRawMany();

    return result.map((r) => r.state as string);
  }

  async getCities(operatorId: string, state: string): Promise<string[]> {
    const result = await this.locationRepo
      .createQueryBuilder('l')
      .select('DISTINCT l.city', 'city')
      .innerJoin('l.providers', 'p')
      .where('l.operator_id = :operatorId', { operatorId })
      .andWhere('UPPER(l.state) = UPPER(:state)', { state })
      .andWhere('p.is_active = true')
      .orderBy('city', 'ASC')
      .getRawMany();

    return result.map((r) => r.city as string);
  }

  async getNeighborhoods(
    operatorId: string,
    state: string,
    city: string,
  ): Promise<string[]> {
    const result = await this.locationRepo
      .createQueryBuilder('l')
      .select('DISTINCT l.neighborhood', 'neighborhood')
      .innerJoin('l.providers', 'p')
      .where('l.operator_id = :operatorId', { operatorId })
      .andWhere('UPPER(l.state) = UPPER(:state)', { state })
      .andWhere('LOWER(l.city) = LOWER(:city)', { city })
      .andWhere('l.neighborhood IS NOT NULL')
      .andWhere('p.is_active = true')
      .orderBy('neighborhood', 'ASC')
      .getRawMany();

    return result.map((r) => r.neighborhood as string);
  }

  async getCategories(operatorId: string): Promise<string[]> {
    const result = await this.serviceRepo
      .createQueryBuilder('s')
      .select('DISTINCT s.category', 'category')
      .innerJoin('s.provider', 'p')
      .where('p.operator_id = :operatorId', { operatorId })
      .andWhere('p.is_active = true')
      .orderBy('category', 'ASC')
      .getRawMany();

    return result.map((r) => r.category as string);
  }

  async getSpecialties(
    operatorId: string,
    category?: string,
  ): Promise<string[]> {
    const qb = this.serviceRepo
      .createQueryBuilder('s')
      .select('DISTINCT s.specialty', 'specialty')
      .innerJoin('s.provider', 'p')
      .where('p.operator_id = :operatorId', { operatorId })
      .andWhere('p.is_active = true');

    if (category) {
      qb.andWhere('LOWER(s.category) = LOWER(:category)', { category });
    }

    const result = await qb.orderBy('specialty', 'ASC').getRawMany();

    return result.map((r) => r.specialty as string);
  }

  private mapToResult(provider: NetworkProvider): ImportedProviderResult {
    const location = provider.location;

    return {
      id: provider.id,
      name: provider.name,
      cnpj: provider.cnpj,
      branchName: provider.branchName,
      networkName: provider.networkName,
      planType: provider.planType,
      address: {
        streetType: location?.streetType,
        streetName: location?.streetName || '',
        streetNumber: location?.streetNumber,
        complement: location?.complement,
        neighborhood: location?.neighborhood,
        city: location?.city || '',
        state: location?.state || '',
        postalCode: location?.postalCode || '',
        fullAddress: location?.fullAddress || '',
        latitude: location?.latitude ? Number(location.latitude) : undefined,
        longitude: location?.longitude ? Number(location.longitude) : undefined,
      },
      phones: {
        phone1:
          provider.phone1AreaCode && provider.phone1
            ? `(${provider.phone1AreaCode}) ${provider.phone1}`
            : undefined,
        phone2:
          provider.phone2AreaCode && provider.phone2
            ? `(${provider.phone2AreaCode}) ${provider.phone2}`
            : undefined,
        whatsapp:
          provider.whatsappAreaCode && provider.whatsapp
            ? `(${provider.whatsappAreaCode}) ${provider.whatsapp}`
            : undefined,
      },
      services:
        provider.services?.map((s) => ({
          category: s.category,
          specialty: s.specialty,
        })) || [],
    };
  }
}
