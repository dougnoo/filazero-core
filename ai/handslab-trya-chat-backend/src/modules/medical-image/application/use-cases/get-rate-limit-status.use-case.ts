import { Injectable, Inject } from '@nestjs/common';
import { IRateLimiter } from '../../domain/interfaces';
import { RATE_LIMITER_TOKEN } from '../../tokens';

/**
 * Use case for getting rate limit status
 * Provides visibility into current rate limiting state
 */
@Injectable()
export class GetRateLimitStatusUseCase {
  constructor(
    @Inject(RATE_LIMITER_TOKEN)
    private readonly rateLimiter: IRateLimiter,
  ) {}

  execute(): {
    maxRequestsPerMinute: number;
    requestDelayMs: number;
    queueLength: number;
    timeSinceLastRequest: number;
    nextRequestAvailableIn: number;
    isProcessing: boolean;
  } {
    const status = this.rateLimiter.getStatus();
    
    return {
      ...status,
      isProcessing: this.rateLimiter.isProcessing(),
    };
  }
}
