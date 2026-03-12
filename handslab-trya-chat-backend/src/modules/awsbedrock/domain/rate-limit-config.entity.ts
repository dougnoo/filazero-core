export class RateLimitConfig {
  constructor(
    public readonly requestsPerMinute: number,
    public readonly requestDelayMs: number,
    public readonly maxProcessingTimeMs: number = 25000,
    public readonly httpTimeoutMs: number = 30000,
  ) {
    if (requestsPerMinute <= 0) {
      throw new Error('Requests per minute must be greater than 0');
    }
  }

  static fromRequestsPerMinute(requestsPerMinute: number): RateLimitConfig {
    const requestDelayMs = Math.floor(60000 / requestsPerMinute);
    return new RateLimitConfig(requestsPerMinute, requestDelayMs);
  }

  getNextRequestDelay(lastRequestTime: number): number {
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    return Math.max(0, this.requestDelayMs - timeSinceLastRequest);
  }
}