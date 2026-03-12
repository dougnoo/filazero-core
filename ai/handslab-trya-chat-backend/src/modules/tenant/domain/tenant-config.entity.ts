/**
 * Domain Entity - Tenant Configuration
 * Pure business logic, no dependencies on frameworks
 */

export enum TenantPlan {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export class TenantConfig {
  constructor(
    public readonly tenantId: string,
    public readonly name: string,
    public readonly awsAgentId: string,
    public readonly awsAgentAliasId: string,
    public readonly vectorStoreNamespace: string,
    public readonly isActive: boolean,
    public readonly plan: TenantPlan,
    public readonly requestsPerMinute: number,
    public readonly maxSessionsPerDay: number,
    public readonly knowledgeBaseId?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.tenantId || this.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Tenant name is required');
    }

    if (!this.awsAgentId || this.awsAgentId.trim().length === 0) {
      throw new Error('AWS Agent ID is required');
    }

    if (!this.awsAgentAliasId || this.awsAgentAliasId.trim().length === 0) {
      throw new Error('AWS Agent Alias ID is required');
    }

    if (!this.vectorStoreNamespace || this.vectorStoreNamespace.trim().length === 0) {
      throw new Error('Vector store namespace is required');
    }

    if (this.requestsPerMinute <= 0) {
      throw new Error('Requests per minute must be greater than 0');
    }

    if (this.maxSessionsPerDay <= 0) {
      throw new Error('Max sessions per day must be greater than 0');
    }
  }

  /**
   * Check if tenant is active
   */
  isActiveStatus(): boolean {
    return this.isActive;
  }

  /**
   * Check if tenant has premium or enterprise plan
   */
  isPremiumOrEnterprise(): boolean {
    return this.plan === TenantPlan.PREMIUM || this.plan === TenantPlan.ENTERPRISE;
  }

  /**
   * Check if tenant can make more requests based on rate limit
   */
  canMakeRequest(requestsInLastMinute: number): boolean {
    return requestsInLastMinute < this.requestsPerMinute;
  }

  /**
   * Check if tenant has exceeded daily session limit
   */
  hasExceededDailyLimit(sessionsToday: number): boolean {
    return sessionsToday >= this.maxSessionsPerDay;
  }

  /**
   * Generate tenant-specific session ID
   */
  generateSessionId(originalSessionId: string): string {
    if (!originalSessionId || originalSessionId.trim().length === 0) {
      throw new Error('Original session ID is required');
    }
    return `${this.tenantId}:${originalSessionId}`;
  }

  /**
   * Get rate limit configuration
   */
  getRateLimitConfig(): { requestsPerMinute: number; delayMs: number } {
    return {
      requestsPerMinute: this.requestsPerMinute,
      delayMs: Math.floor(60000 / this.requestsPerMinute),
    };
  }

  /**
   * Factory method for basic plan tenant
   */
  static createBasic(
    tenantId: string,
    name: string,
    awsAgentId: string,
    awsAgentAliasId: string,
    vectorStoreNamespace: string,
  ): TenantConfig {
    return new TenantConfig(
      tenantId,
      name,
      awsAgentId,
      awsAgentAliasId,
      vectorStoreNamespace,
      true,
      TenantPlan.BASIC,
      5, // 5 requests per minute
      500, // 500 sessions per day
    );
  }

  /**
   * Factory method for premium plan tenant
   */
  static createPremium(
    tenantId: string,
    name: string,
    awsAgentId: string,
    awsAgentAliasId: string,
    vectorStoreNamespace: string,
    knowledgeBaseId?: string,
  ): TenantConfig {
    return new TenantConfig(
      tenantId,
      name,
      awsAgentId,
      awsAgentAliasId,
      vectorStoreNamespace,
      true,
      TenantPlan.PREMIUM,
      10, // 10 requests per minute
      1000, // 1000 sessions per day
      knowledgeBaseId,
    );
  }

  /**
   * Factory method for enterprise plan tenant
   */
  static createEnterprise(
    tenantId: string,
    name: string,
    awsAgentId: string,
    awsAgentAliasId: string,
    vectorStoreNamespace: string,
    requestsPerMinute: number = 20,
    maxSessionsPerDay: number = 5000,
    knowledgeBaseId?: string,
  ): TenantConfig {
    return new TenantConfig(
      tenantId,
      name,
      awsAgentId,
      awsAgentAliasId,
      vectorStoreNamespace,
      true,
      TenantPlan.ENTERPRISE,
      requestsPerMinute,
      maxSessionsPerDay,
      knowledgeBaseId,
    );
  }

  /**
   * Create copy with updated status
   */
  withActiveStatus(isActive: boolean): TenantConfig {
    return new TenantConfig(
      this.tenantId,
      this.name,
      this.awsAgentId,
      this.awsAgentAliasId,
      this.vectorStoreNamespace,
      isActive,
      this.plan,
      this.requestsPerMinute,
      this.maxSessionsPerDay,
      this.knowledgeBaseId,
      this.createdAt,
      new Date(),
    );
  }
}
