/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantResolutionService } from '../application/services/tenant-resolution.service';

/**
 * Interceptor que injeta o tenantId em todas as requisições
 * Útil para garantir que o tenantId esteja disponível em todo o contexto
 *
 * Ordem de prioridade:
 * 1. request.user.tenantId (do JwtAuthGuard via Cognito/DB)
 * 2. request.headers['x-tenant-id'] (header explícito - UUID)
 * 3. request.params.tenantId / request.query.tenantId (path/query - UUID)
 * 4. request.headers['x-tenant-name'] / request.query.tenant (slug -> resolve para UUID)
 * 5. Origin/Referer (extrair slug do hostname e buscar tenant no DB)
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  // Regex para validar se uma string é um UUID v4/v7
  private readonly uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  constructor(
    private readonly tenantResolutionService: TenantResolutionService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // Extrair tenant de várias fontes (ordem de prioridade)
    let tenantId: string | undefined =
      request.user?.tenantId || // Do usuário autenticado (mais seguro)
      request.headers['x-tenant-id'] || // Do header explícito (UUID)
      request.params?.tenantId || // Do path parameter (UUID)
      request.query?.tenantId; // Do query parameter (UUID)

    // Validar se é UUID; se não for, descartar e tentar outras fontes
    if (tenantId && !this.uuidRegex.test(tenantId)) {
      tenantId = undefined;
    }

    // Se ainda não temos tenantId, tentar resolver via slug (tenant/tenantName)
    if (!tenantId) {
      const tenantSlug: string | undefined =
        request.headers['x-tenant-name'] || // Header com slug
        request.query?.tenant || // Query param ?tenant=slug
        request.query?.tenantName; // Query param ?tenantName=slug

      if (tenantSlug) {
        tenantId =
          await this.tenantResolutionService.resolveTenantIdFromSlug(
            tenantSlug,
          );
      }
    }

    // Se ainda não temos tenantId, tentar resolver via Origin/Referer
    if (!tenantId) {
      const origin = request.headers.origin;
      const referer = request.headers.referer;

      if (origin || referer) {
        tenantId = await this.tenantResolutionService.resolveTenantIdFromOrigin(
          origin,
          referer,
        );
      }
    }

    // Injetar no request para fácil acesso
    if (tenantId) {
      request.tenantId = tenantId;

      // Se o user existe mas não tinha tenantId, preencher também
      if (request.user && !request.user.tenantId) {
        request.user.tenantId = tenantId;
      }
    }

    return next.handle();
  }
}
