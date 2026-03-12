import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IAmilRepository } from '../../domain/repositories/amil-repository.interface';
import { AMIL_REPOSITORY_TOKEN } from '../../domain/repositories/amil-repository.interface';
import type { IImportedNetworkRepository } from '../../domain/repositories/imported-network.repository.interface';
import { IMPORTED_NETWORK_REPOSITORY_TOKEN } from '../../domain/repositories/imported-network.repository.interface';
import { Tenant } from '../../../../database/entities/tenant.entity';
import { HealthOperator } from '../../../../database/entities/health-operator.entity';
import { HealthOperatorStatus } from '../../../../shared/domain/enums/health-operator-status.enum';

export interface HybridSearchParams {
  tenantId: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  category?: string;
  specialty?: string;
  planType?: string;
  limit?: number;
  offset?: number;
  // Parâmetros para fallback Amil
  networkCode?: string;
  planCode?: string;
  serviceType?: string;
}

export interface HybridSearchResult {
  source: 'imported' | 'amil';
  providers: any[];
  total?: number;
}

@Injectable()
export class SearchProvidersHybridUseCase {
  private readonly logger = new Logger(SearchProvidersHybridUseCase.name);

  constructor(
    @Inject(AMIL_REPOSITORY_TOKEN)
    private readonly amilRepository: IAmilRepository,
    @Inject(IMPORTED_NETWORK_REPOSITORY_TOKEN)
    private readonly importedNetworkRepo: IImportedNetworkRepository,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(HealthOperator)
    private readonly operatorRepo: Repository<HealthOperator>,
  ) {}

  async execute(params: HybridSearchParams): Promise<HybridSearchResult> {
    // 1. Buscar tenant e sua operadora
    const tenant = await this.tenantRepo.findOne({
      where: { id: params.tenantId },
    });

    if (!tenant || !tenant.operatorId) {
      this.logger.debug(
        `Tenant ${params.tenantId} sem operadora, usando fallback Amil`,
      );
      return this.searchAmil(params);
    }

    // 2. Verificar status da operadora
    const operator = await this.operatorRepo.findOne({
      where: { id: tenant.operatorId },
    });

    if (
      !operator ||
      operator.status !== HealthOperatorStatus.REDE_CREDENCIADA_DISPONIVEL
    ) {
      this.logger.debug(
        `Operadora ${tenant.operatorId} não habilitada, usando fallback Amil`,
      );
      return this.searchAmil(params);
    }

    // 3. Verificar se tem rede importada
    const hasNetwork = await this.importedNetworkRepo.hasImportedNetwork(
      tenant.operatorId,
    );

    if (!hasNetwork) {
      this.logger.debug(
        `Operadora ${tenant.operatorId} sem rede importada, usando fallback Amil`,
      );
      return this.searchAmil(params);
    }

    // 4. Buscar na base importada
    this.logger.debug(
      `Buscando na base importada para operadora ${tenant.operatorId}`,
    );

    const [providers, total] = await Promise.all([
      this.importedNetworkRepo.searchProviders({
        operatorId: tenant.operatorId,
        state: params.state,
        city: params.city,
        neighborhood: params.neighborhood,
        category: params.category,
        specialty: params.specialty,
        planType: params.planType,
        limit: params.limit || 50,
        offset: params.offset || 0,
      }),
      this.importedNetworkRepo.countProviders({
        operatorId: tenant.operatorId,
        state: params.state,
        city: params.city,
        neighborhood: params.neighborhood,
        category: params.category,
        specialty: params.specialty,
        planType: params.planType,
      }),
    ]);

    return {
      source: 'imported',
      providers,
      total,
    };
  }

  private async searchAmil(
    params: HybridSearchParams,
  ): Promise<HybridSearchResult> {
    // Se não tem parâmetros necessários para Amil, retorna vazio
    if (
      !params.networkCode ||
      !params.planCode ||
      !params.state ||
      !params.city ||
      !params.serviceType ||
      !params.specialty
    ) {
      return {
        source: 'amil',
        providers: [],
      };
    }

    try {
      const result = await this.amilRepository.searchProviders({
        networkCode: params.networkCode,
        planCode: params.planCode,
        state: params.state,
        municipality: params.city,
        serviceType: params.serviceType,
        specialty: params.specialty,
        neighborhood: params.neighborhood,
      });

      result.validate();

      return {
        source: 'amil',
        providers: result.providers || [],
      };
    } catch (error) {
      this.logger.error(`Erro ao buscar na Amil: ${error}`);
      return {
        source: 'amil',
        providers: [],
      };
    }
  }

  /**
   * Determina a fonte de dados para um tenant
   */
  async getDataSource(
    tenantId: string,
  ): Promise<{ source: 'imported' | 'amil'; operatorId?: string }> {
    const tenant = await this.tenantRepo.findOne({
      where: { id: tenantId },
    });

    if (!tenant || !tenant.operatorId) {
      return { source: 'amil' };
    }

    const operator = await this.operatorRepo.findOne({
      where: { id: tenant.operatorId },
    });

    if (
      !operator ||
      operator.status !== HealthOperatorStatus.REDE_CREDENCIADA_DISPONIVEL
    ) {
      return { source: 'amil' };
    }

    const hasNetwork = await this.importedNetworkRepo.hasImportedNetwork(
      tenant.operatorId,
    );

    if (!hasNetwork) {
      return { source: 'amil' };
    }

    return { source: 'imported', operatorId: tenant.operatorId };
  }

  /**
   * Obtém opções de filtro baseado na fonte de dados do tenant
   */
  async getFilterOptions(tenantId: string) {
    const dataSource = await this.getDataSource(tenantId);

    if (dataSource.source === 'imported' && dataSource.operatorId) {
      return {
        source: 'imported',
        options: await this.importedNetworkRepo.getFilterOptions(
          dataSource.operatorId,
        ),
      };
    }

    // Para Amil, retorna estrutura vazia - filtros são carregados dinamicamente
    return {
      source: 'amil',
      options: {
        states: [],
        cities: [],
        neighborhoods: [],
        categories: [],
        specialties: [],
      },
    };
  }
}
