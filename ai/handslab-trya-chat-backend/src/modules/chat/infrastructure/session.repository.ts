import { Injectable, Logger } from '@nestjs/common';
import { ISessionRepository } from '../domain/interfaces/session-repository.interface';
import { TenantSession } from '../domain/tenant-session.entity';

@Injectable()
export class SessionRepository implements ISessionRepository {
  private readonly logger = new Logger(SessionRepository.name);
  private activeSessions = new Map<string, TenantSession>();
  private tenantRooms = new Map<string, Set<string>>(); // tenantId -> Set of socketIds

  createSession(
    socketId: string,
    sessionId: string,
    tenantId: string,
    tenantName?: string,
  ): TenantSession {
    const session = TenantSession.create(socketId, sessionId, tenantId, tenantName);
    
    // Store in active sessions
    this.activeSessions.set(socketId, session);
    
    // Add to tenant room
    if (!this.tenantRooms.has(tenantId)) {
      this.tenantRooms.set(tenantId, new Set());
    }
    this.tenantRooms.get(tenantId)!.add(socketId);
    
    this.logger.debug(`Session created: ${socketId} for tenant ${tenantId}`);
    return session;
  }

  getSession(socketId: string): TenantSession | undefined {
    return this.activeSessions.get(socketId);
  }

  removeSession(socketId: string): boolean {
    const session = this.activeSessions.get(socketId);
    if (!session) {
      return false;
    }

    // Remove from active sessions
    this.activeSessions.delete(socketId);
    
    // Remove from tenant room
    const tenantSockets = this.tenantRooms.get(session.tenantId);
    if (tenantSockets) {
      tenantSockets.delete(socketId);
      if (tenantSockets.size === 0) {
        this.tenantRooms.delete(session.tenantId);
      }
    }

    this.logger.debug(`Session removed: ${socketId} for tenant ${session.tenantId}`);
    return true;
  }

  getSessionsByTenant(tenantId: string): TenantSession[] {
    const socketIds = this.tenantRooms.get(tenantId) || new Set();
    const sessions: TenantSession[] = [];
    
    for (const socketId of socketIds) {
      const session = this.activeSessions.get(socketId);
      if (session) {
        sessions.push(session);
      }
    }
    
    return sessions;
  }

  cleanupExpiredSessions(maxAgeMs: number = 3600000): number {
    let cleanedCount = 0;
    const now = Date.now();
    
    for (const [socketId, session] of this.activeSessions.entries()) {
      if (session.isExpired(maxAgeMs)) {
        this.removeSession(socketId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired sessions`);
    }
    
    return cleanedCount;
  }

  getAllActiveSessions(): TenantSession[] {
    return Array.from(this.activeSessions.values());
  }

  // Additional utility methods for gateway integration
  getTenantRoomSockets(tenantId: string): Set<string> {
    return this.tenantRooms.get(tenantId) || new Set();
  }

  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  getActiveTenantCount(): number {
    return this.tenantRooms.size;
  }

  // Legacy method names for backward compatibility
  getSessionCount(): number {
    return this.getActiveSessionCount();
  }

  getTenantCount(): number {
    return this.getActiveTenantCount();
  }
}