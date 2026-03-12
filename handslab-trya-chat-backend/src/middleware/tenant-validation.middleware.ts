import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../modules/tenant/tenant.service';

@Injectable()
export class TenantValidationMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extrair tenantId do header ou body
    const tenantId = req.headers['x-tenant-id'] as string || 
                    (req.body && req.body.tenantId);

    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }

    // Validar se o tenant existe e está ativo
    const isValid = await this.tenantService.validateTenantAccess(tenantId);
    
    if (!isValid) {
      throw new UnauthorizedException(`Invalid or inactive tenant: ${tenantId}`);
    }

    // Adicionar tenant info no request para uso posterior
    (req as any).tenant = await this.tenantService.getTenantConfig(tenantId);
    
    next();
  }
}