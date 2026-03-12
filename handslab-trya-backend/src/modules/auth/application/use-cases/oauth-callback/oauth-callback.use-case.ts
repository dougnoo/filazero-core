import { Inject, Injectable } from '@nestjs/common';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.token';
import { OAuthCallbackDto } from './oauth-callback.dto';
import { OAuthCallbackResponseDto } from './oauth-callback-response.dto';
import { TenantMismatchError } from '../../../domain/errors/tenant-mismatch.error';
import { NotImplementedError } from '../../../domain/errors/not-implemented.error';
import { InvalidAuthorizationCodeError } from '../../../domain/errors/invalid-authorization-code.error';

@Injectable()
export class OAuthCallbackUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(dto: OAuthCallbackDto): Promise<OAuthCallbackResponseDto> {
    if (!dto.code) {
      throw new InvalidAuthorizationCodeError(
        'Código de autorização não fornecido',
      );
    }

    if (!this.authRepository.exchangeCodeForTokens) {
      throw new NotImplementedError(
        'OAuth Authorization Code Flow não está disponível nesta implementação',
      );
    }

    const result = await this.authRepository.exchangeCodeForTokens(dto.code);

    // Validar tenant se fornecido
    if (dto.tenantId && result.user.tenantId !== dto.tenantId) {
      throw new TenantMismatchError();
    }

    return {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresIn: result.tokens.expiresIn,
    };
  }
}
