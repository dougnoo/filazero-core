import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import type { IUserLookupRepository } from '../../../domain/repositories/user-lookup.repository.interface';
import { AUTH_REPOSITORY_TOKEN } from '../../../domain/repositories/auth.repository.token';
import { USER_LOOKUP_REPOSITORY_TOKEN } from '../../../domain/repositories/user-lookup.repository.interface';
import { UserCacheService } from '../../../infrastructure/cache/user-cache.service';

export interface EnrichedUser {
  sub: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

@Injectable()
export class EnrichUserFromTokenUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    @Inject(USER_LOOKUP_REPOSITORY_TOKEN)
    private readonly userLookupRepository: IUserLookupRepository,
    private readonly userCacheService: UserCacheService,
  ) {}

  async execute(accessToken: string): Promise<EnrichedUser> {
    const cached = this.userCacheService.get(accessToken);
    if (cached) {
      return cached;
    }

    const cognitoUser = await this.authRepository.getUserInfo(accessToken);

    if (!cognitoUser) {
      throw new UnauthorizedException('Usuário não encontrado no Cognito');
    }

    const dbUser = await this.userLookupRepository.findIdByEmail(
      cognitoUser.email,
    );

    if (!dbUser) {
      throw new UnauthorizedException(
        'Usuário não encontrado no banco de dados',
      );
    }

    const enrichedUser: EnrichedUser = {
      sub: dbUser.id,
      email: cognitoUser.email,
      name: cognitoUser.name,
      role: dbUser.role,
      tenantId: dbUser.tenantId,
    };

    this.userCacheService.set(accessToken, enrichedUser);

    return enrichedUser;
  }
}
