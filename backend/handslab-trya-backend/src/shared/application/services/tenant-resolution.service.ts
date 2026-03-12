/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ITenantRepository } from '../../../modules/tenant/domain/repositories/tenant.repository.interface';
import { TENANT_REPOSITORY_TOKEN } from '../../../modules/tenant/domain/repositories/tenant.repository.token';
import { normalizeTenantName } from '../../domain/tenant-mapping';

@Injectable()
export class TenantResolutionService {
  private readonly logger = new Logger(TenantResolutionService.name);

  constructor(
    @Inject(TENANT_REPOSITORY_TOKEN)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  /**
   * Extrai o tenant slug do hostname
   * Ex: dev-app-grupotrigo.trya.ai -> grupotrigo
   * Ex: app-clinicasaude.trya.ai -> clinicasaude
   * Ex: dev-app.trya.ai -> trigo (tenant padrão para dev)
   */
  extractTenantSlugFromHostname(hostname: string): string | null {
    if (!hostname) return null;

    // Padrões esperados:
    // - dev-app-{tenant}.trya.ai
    // - app-{tenant}.trya.ai
    // - {tenant}.trya.ai
    const patterns = [
      /^(?:dev-|hml-)?app-([^.]+)\.trya\.ai$/i, // dev-app-tenant, hml-app-tenant ou app-tenant
      /^([^.]+)\.trya\.ai$/i, // tenant.trya.ai
    ];

    for (const pattern of patterns) {
      const match = hostname.match(pattern);
      if (match && match[1]) {
        // Se o match for apenas "app" ou "dev-app", não é um tenant válido
        const slug = match[1].toLowerCase();
        if (slug === 'app' || slug === 'dev-app') {
          // Hostname genérico (dev-app.trya.ai), retorna tenant padrão
          this.logger.debug(
            `Hostname genérico detectado: ${hostname}, usando tenant padrão`,
          );
          return 'Grupo Trigo'; // Nome do tenant padrão no banco
        }
        return match[1];
      }
    }

    return null;
  }

  /**
   * Resolve o tenantId a partir do Origin ou Referer
   * Retorna o UUID do tenant ou undefined
   */
  async resolveTenantIdFromOrigin(
    origin: string | undefined,
    referer: string | undefined,
  ): Promise<string | undefined> {
    let hostname: string | undefined;

    // Tentar extrair hostname do Origin
    if (origin) {
      try {
        const url = new URL(origin);
        hostname = url.hostname;
      } catch (error) {
        this.logger.warn(`Falha ao parsear Origin: ${origin}`);
      }
    }

    // Fallback para Referer se Origin não funcionar
    if (!hostname && referer) {
      try {
        const url = new URL(referer);
        hostname = url.hostname;
      } catch (error) {
        this.logger.warn(`Falha ao parsear Referer: ${referer}`);
      }
    }

    if (!hostname) {
      return undefined;
    }

    // Extrair slug do tenant
    const slug = this.extractTenantSlugFromHostname(hostname);
    if (!slug) {
      this.logger.debug(`Não foi possível extrair tenant slug de: ${hostname}`);
      return undefined;
    }

    // Normalizar usando o mapeamento
    const normalizedName = normalizeTenantName(slug);

    // Buscar tenant no banco pelo nome
    try {
      const tenant = await this.tenantRepository.findByName(normalizedName);
      if (tenant && tenant.active) {
        this.logger.debug(
          `Tenant resolvido via Origin/Referer: ${normalizedName} -> ${tenant.id}`,
        );
        return tenant.id;
      }

      // Se não encontrou pelo nome normalizado, tentar pelo slug original
      if (normalizedName !== slug) {
        const tenantBySlug = await this.tenantRepository.findByName(slug);
        if (tenantBySlug && tenantBySlug.active) {
          this.logger.debug(
            `Tenant resolvido via slug original: ${slug} -> ${tenantBySlug.id}`,
          );
          return tenantBySlug.id;
        }
      }

      this.logger.warn(
        `Tenant não encontrado para: ${normalizedName} (slug: ${slug})`,
      );
      return undefined;
    } catch (error) {
      this.logger.error(`Erro ao buscar tenant: ${error}`);
      return undefined;
    }
  }

  /**
   * Resolve tenantId a partir de um slug/nome de tenant
   * Útil quando o frontend envia apenas o slug (ex: ?tenant=grupotrigo)
   * @param tenantSlugOrName Slug ou nome do tenant
   * @returns UUID do tenant ou undefined
   */
  async resolveTenantIdFromSlug(
    tenantSlugOrName: string | undefined,
  ): Promise<string | undefined> {
    if (!tenantSlugOrName || tenantSlugOrName.trim() === '') {
      return undefined;
    }

    const normalizedName = normalizeTenantName(tenantSlugOrName);

    try {
      // Tenta pelo nome normalizado primeiro
      const tenant = await this.tenantRepository.findByName(normalizedName);
      if (tenant && tenant.active) {
        this.logger.debug(
          `Tenant resolvido via slug: ${tenantSlugOrName} -> ${tenant.id}`,
        );
        return tenant.id;
      }

      // Fallback: tenta pelo slug original (sem normalizar)
      if (normalizedName !== tenantSlugOrName) {
        const tenantByOriginal =
          await this.tenantRepository.findByName(tenantSlugOrName);
        if (tenantByOriginal && tenantByOriginal.active) {
          this.logger.debug(
            `Tenant resolvido via nome original: ${tenantSlugOrName} -> ${tenantByOriginal.id}`,
          );
          return tenantByOriginal.id;
        }
      }

      this.logger.debug(
        `Tenant não encontrado para slug/nome: ${tenantSlugOrName}`,
      );
      return undefined;
    } catch (error) {
      this.logger.error(`Erro ao resolver tenant por slug: ${error}`);
      return undefined;
    }
  }
}
