import { Inject, Injectable } from '@nestjs/common';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.token';
import { RefreshTokenDto } from './refresh-token.dto';
import { RefreshTokenResponseDto } from './refresh-token-response.dto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    const tokens = await this.authRepository.refreshToken(dto.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }
}
