import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para obter o tenantId do request
 * O tenant pode vir de várias fontes (header, user, etc)
 *
 * Uso: @TenantId() tenantId: string
 */
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();

    // Prioridade 1: Tenant do usuário autenticado (mais seguro)
    if (request.user?.tenantId) {
      return request.user.tenantId;
    }

    // Prioridade 2: Header X-Tenant-Id (para autenticação inicial)
    if (request.headers['x-tenant-id']) {
      return request.headers['x-tenant-id'];
    }

    // Prioridade 3: Tenant já extraído por middleware
    if (request.tenantId) {
      return request.tenantId;
    }

    return undefined;
  },
);
