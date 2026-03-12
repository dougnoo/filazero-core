import { Injectable, Inject } from '@nestjs/common';
import {
  AUTH_REPOSITORY_TOKEN,
  type IAuthRepository,
} from '../../../domain/repositories/auth.repository.interface';
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

    return new RefreshTokenResponseDto(
      tokens.accessToken,
      tokens.refreshToken,
      tokens.expiresIn,
      tokens.tokenType,
    );
  }
}
