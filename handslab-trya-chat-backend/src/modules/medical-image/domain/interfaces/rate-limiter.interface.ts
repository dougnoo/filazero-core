/**
 * Port interface for rate limiting medical image analysis requests
 * Ensures compliance with API quotas and prevents throttling
 */
export interface IRateLimiter {
  /**
   * Wait until next request is allowed based on rate limit
   * Queues the request and resolves when ready
   */
  waitForSlot(): Promise<void>;

  /**
   * Get current rate limit status
   */
  getStatus(): {
    maxRequestsPerMinute: number;
    requestDelayMs: number;
    queueLength: number;
    timeSinceLastRequest: number;
    nextRequestAvailableIn: number;
  };

  /**
   * Check if rate limiter is currently processing queue
   */
  isProcessing(): boolean;
}
