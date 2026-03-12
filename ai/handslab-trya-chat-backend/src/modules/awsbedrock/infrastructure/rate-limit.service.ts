import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IRateLimitService } from '../domain/interfaces/rate-limit-service.interface';
import { RateLimitConfig } from '../domain/rate-limit-config.entity';

@Injectable()
export class RateLimitService implements IRateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly globalConfig: RateLimitConfig;
  private readonly tenantConfigs: Map<string, RateLimitConfig> = new Map();
  
  // Controle de taxa global
  private lastRequestTime: number = 0;
  private requestCountBySession: Map<string, { count: number; startTime: number }> = new Map();

  // Controle de taxa por tenant
  private tenantLastRequestTime: Map<string, number> = new Map();

  constructor(private configService: ConfigService) {
    const requestsPerMinute = this.configService.get<number>('BEDROCK_REQUESTS_PER_MINUTE', 4);
    this.globalConfig = RateLimitConfig.fromRequestsPerMinute(requestsPerMinute);
    
    this.logger.log(`Rate limiting configured: ${requestsPerMinute} req/min (delay: ${this.globalConfig.requestDelayMs}ms)`);
  }

  async enforceRateLimit(sessionId: string): Promise<void> {
    const now = Date.now();
    
    // Verificar rate limit global
    const delayNeeded = this.globalConfig.getNextRequestDelay(this.lastRequestTime);
    if (delayNeeded > 0) {
      this.logger.debug(`Rate limit: waiting ${delayNeeded}ms`);
      await this.delay(delayNeeded);
    }
    
    this.lastRequestTime = Date.now();

    // Controle por sessão
    const sessionData = this.requestCountBySession.get(sessionId);
    const currentTime = Date.now();
    
    if (!sessionData) {
      this.requestCountBySession.set(sessionId, { count: 1, startTime: currentTime });
    } else {
      // Reset counter se já passou 1 minuto
      if (currentTime - sessionData.startTime > 60000) {
        this.requestCountBySession.set(sessionId, { count: 1, startTime: currentTime });
      } else {
        sessionData.count++;
        if (sessionData.count > this.globalConfig.requestsPerMinute) {
          const waitTime = 60000 - (currentTime - sessionData.startTime);
          this.logger.warn(`Session ${sessionId} rate limited: waiting ${waitTime}ms`);
          await this.delay(waitTime);
          this.requestCountBySession.set(sessionId, { count: 1, startTime: Date.now() });
        }
      }
    }
  }

  async enforceRateLimitForTenant(tenantId: string, sessionId: string): Promise<void> {
    // Obter ou criar configuração do tenant
    let config = this.tenantConfigs.get(tenantId);
    if (!config) {
      // Usar configuração padrão se não há configuração específica do tenant
      config = this.globalConfig;
      this.tenantConfigs.set(tenantId, config);
      this.logger.debug(`Using global rate limit config for tenant ${tenantId}: ${config.requestsPerMinute} req/min`);
    }

    const lastRequest = this.tenantLastRequestTime.get(tenantId) || 0;
    const delayNeeded = config.getNextRequestDelay(lastRequest);
    
    if (delayNeeded > 0) {
      this.logger.debug(`Tenant ${tenantId} rate limit: waiting ${delayNeeded}ms`);
      await this.delay(delayNeeded);
    }
    
    this.tenantLastRequestTime.set(tenantId, Date.now());
  }

  getRateLimitStatus(sessionId?: string): {
    requestsPerMinute: number;
    requestDelayMs: number;
    lastRequestTime: number;
    nextRequestAvailableIn: number;
  } {
    const config = this.globalConfig;
    const lastRequest = this.lastRequestTime;
    const nextRequestAvailableIn = config.getNextRequestDelay(lastRequest);

    return {
      requestsPerMinute: config.requestsPerMinute,
      requestDelayMs: config.requestDelayMs,
      lastRequestTime: lastRequest,
      nextRequestAvailableIn: nextRequestAvailableIn,
    };
  }

  cleanupOldSessions(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000; // 1 hora

    for (const [sessionId, sessionData] of this.requestCountBySession.entries()) {
      if (sessionData.startTime < oneHourAgo) {
        this.requestCountBySession.delete(sessionId);
      }
    }

    this.logger.debug(`Cleaned up old sessions. Active sessions: ${this.requestCountBySession.size}`);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}