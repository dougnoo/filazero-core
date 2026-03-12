export interface IRateLimitService {
  enforceRateLimit(sessionId: string): Promise<void>;
  enforceRateLimitForTenant(tenantId: string, sessionId: string): Promise<void>;
  getRateLimitStatus(sessionId?: string): {
    requestsPerMinute: number;
    requestDelayMs: number;
    lastRequestTime: number;
    nextRequestAvailableIn: number;
  };
}