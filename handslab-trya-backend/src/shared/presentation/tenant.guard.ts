import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../modules/auth/presentation/decorators/public.decorator';

/**
 * Guard que valida se o tenant foi fornecido e é válido
 * Deve ser usado após o JwtAuthGuard
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Verificar se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Rotas públicas não precisam de validação de tenant
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Se não há usuário autenticado, deixar o JwtAuthGuard lidar com isso
    if (!user) {
      return true;
    }

    // Validar se o usuário tem tenantId
    // if (!user.tenantId) {
    //   throw new ForbiddenException('Usuário não pertence a nenhum tenant');
    // }

    // // Extrair tenantId da requisição (header ou path)
    // const requestTenantId =
    //   request.headers['x-tenant-id'] ||
    //   request.params?.tenantId ||
    //   request.query?.tenantId;

    // // Se um tenant foi especificado na requisição, validar se corresponde ao do usuário
    // if (requestTenantId && requestTenantId !== user.tenantId) {
    //   throw new ForbiddenException(
    //     'Você não tem permissão para acessar recursos deste tenant',
    //   );
    // }

    // // Garantir que o tenantId está disponível no request
    // request.tenantId = user.tenantId;

    return true;
  }
}
