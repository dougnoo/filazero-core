/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GetUserInfoUseCase } from '../../application/use-cases/get-user-info/get-user-info.use-case';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly getUserInfoUseCase: GetUserInfoUseCase,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se a rota é pública, permitir acesso sem token
    if (isPublic) {
      return true;
    }

    let token: string | undefined;

    if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient();
      token = this.extractTokenFromWs(client);
    } else {
      const request = context.switchToHttp().getRequest();
      token = this.extractTokenFromHttp(request);
    }

    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      const user = await this.getUserInfoUseCase.execute(token);

      // Sanitizar tenantId: nunca propagar string vazia (causa erro UUID no SQL)
      // Se for string vazia ou falsy, deixar como undefined
      const sanitizedTenantId =
        user.tenantId && user.tenantId.trim() !== ''
          ? user.tenantId
          : undefined;

      const userPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: sanitizedTenantId,
        dbId: user.dbId,
      };

      if (context.getType() === 'ws') {
        const client = context.switchToWs().getClient();
        client.user = userPayload;
      } else {
        const request = context.switchToHttp().getRequest();
        request.user = userPayload;
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private extractTokenFromHttp(request: any): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return undefined;
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      return undefined;
    }

    return token;
  }

  private extractTokenFromWs(client: any): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    const queryToken = client.handshake.query.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    return undefined;
  }
}
