import { Injectable } from '@nestjs/common';
import type { EnrichedUser } from '../../application/use-cases/enrich-user-from-token/enrich-user-from-token.use-case';

@Injectable()
export class UserCacheService {
  private readonly cache = new Map<
    string,
    { user: EnrichedUser; expiresAt: number }
  >();
  private readonly TTL = 5 * 60 * 1000; // 5 minutos

  set(token: string, user: EnrichedUser): void {
    this.cache.set(token, {
      user,
      expiresAt: Date.now() + this.TTL,
    });
  }

  get(token: string): EnrichedUser | null {
    const cached = this.cache.get(token);

    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(token);
      return null;
    }

    return cached.user;
  }

  clear(token: string): void {
    this.cache.delete(token);
  }

  clearAll(): void {
    this.cache.clear();
  }
}
