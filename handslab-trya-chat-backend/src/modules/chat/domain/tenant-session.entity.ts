export class TenantSession {
  constructor(
    public readonly socketId: string,
    public readonly sessionId: string,
    public readonly tenantId: string,
    public readonly tenantName?: string,
    public readonly connectedAt?: Date,
  ) {
    if (!socketId || !sessionId || !tenantId) {
      throw new Error('SocketId, sessionId, and tenantId are required');
    }
  }

  static create(
    socketId: string,
    sessionId: string,
    tenantId: string,
    tenantName?: string,
  ): TenantSession {
    return new TenantSession(
      socketId,
      sessionId,
      tenantId,
      tenantName,
      new Date(),
    );
  }

  isExpired(maxAgeMs: number = 3600000): boolean { // 1 hour default
    if (!this.connectedAt) return false;
    return Date.now() - this.connectedAt.getTime() > maxAgeMs;
  }

  getSessionKey(): string {
    return `${this.tenantId}:${this.sessionId}`;
  }
}