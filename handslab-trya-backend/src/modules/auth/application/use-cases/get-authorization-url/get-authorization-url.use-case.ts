import { Inject, Injectable } from '@nestjs/common';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.token';
import { GetAuthorizationUrlDto } from './get-authorization-url.dto';
import { GetAuthorizationUrlResponseDto } from './get-authorization-url-response.dto';
import { NotImplementedError } from '../../../domain/errors/not-implemented.error';

@Injectable()
export class GetAuthorizationUrlUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    dto: GetAuthorizationUrlDto,
  ): Promise<GetAuthorizationUrlResponseDto> {
    if (!this.authRepository.getAuthorizationUrl) {
      throw new NotImplementedError(
        'OAuth Authorization Code Flow não está disponível nesta implementação',
      );
    }

    const authorizationUrl = this.authRepository.getAuthorizationUrl(dto.state);

    return {
      authorizationUrl,
    };
  }
}
