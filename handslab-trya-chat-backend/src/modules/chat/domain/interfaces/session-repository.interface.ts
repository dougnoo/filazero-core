import { TenantSession } from '../tenant-session.entity';

export interface ISessionRepository {
  createSession(
    socketId: string,
    sessionId: string,
    tenantId: string,
    tenantName?: string,
  ): TenantSession;
  
  getSession(socketId: string): TenantSession | undefined;
  removeSession(socketId: string): boolean;
  getSessionsByTenant(tenantId: string): TenantSession[];
  cleanupExpiredSessions(): number;
  getAllActiveSessions(): TenantSession[];
  getActiveSessionCount(): number;
  getActiveTenantCount(): number;
}