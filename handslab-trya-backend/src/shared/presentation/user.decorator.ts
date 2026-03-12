import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para obter o ID do usuário autenticado
 *
 * Uso: @UserId() userId: string
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
);

/**
 * Decorator para obter o email do usuário autenticado
 *
 * Uso: @UserEmail() email: string
 */
export const UserEmail = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.email;
  },
);

/**
 * Decorator para obter a role do usuário autenticado
 *
 * Uso: @UserRole() role: UserRole
 */
export const UserRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.role;
  },
);
