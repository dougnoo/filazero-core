import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../domain/enums/user-role.enum';
import { ROLES_KEY } from './roles.decorator';
import { IS_PUBLIC_KEY } from '../../modules/auth/presentation/decorators/public.decorator';

/**
 * Guard que valida se o usuário tem as roles necessárias
 * Deve ser usado após o JwtAuthGuard
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Verificar se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Obter roles requeridas
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não há roles requeridas, permitir acesso
    if (!requiredRoles) {
      return true;
    }

    let user;
    if (context.getType() === 'ws') {
      user = context.switchToWs().getClient().user;
    } else {
      user = context.switchToHttp().getRequest().user;
    }

    // Se não há usuário, deixar o JwtAuthGuard lidar com isso
    if (!user) {
      return true;
    }

    // Verificar se o usuário tem pelo menos uma das roles requeridas
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este recurso',
      );
    }

    return true;
  }
}
