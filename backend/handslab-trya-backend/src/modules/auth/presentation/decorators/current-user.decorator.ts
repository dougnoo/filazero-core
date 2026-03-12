import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';

/**
 * Decorator para obter o usuário autenticado do request
 * Uso: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
