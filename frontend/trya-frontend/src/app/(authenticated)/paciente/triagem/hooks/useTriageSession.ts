import { useState, useEffect, useCallback, useRef } from "react";
import { triageHistoryService, TriageSessionResponse } from "../services/triageHistoryService";
import { generateUUID } from "@/shared/services/chatService";

export interface UseTriageSessionReturn {
  currentSession: TriageSessionResponse | null;
  isLoading: boolean;
  sessionId: string;
  shouldConnectSocket: boolean;
  loadSession: (sessionId: string) => Promise<void>;
  loadActiveOrNew: () => Promise<void>;
  updateSessionFromResponse: (sessionId: string) => void;
  updateSessionStage: (newStage: string) => void;
}

export function useTriageSession(urlSessionId: string | null): UseTriageSessionReturn {
  const tempSessionIdRef = useRef<string>(generateUUID());
  const [currentSession, setCurrentSession] = useState<TriageSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const prevUrlSessionIdRef = useRef<string | null>(urlSessionId);
  const hasInitializedRef = useRef(false);
  const loadingSessionIdRef = useRef<string | null>(null);

  const sessionId = currentSession?.sessionId || tempSessionIdRef.current;

  // Connect if: no session, no status (new), or DRAFT status
  const status = currentSession?.status;
  const shouldConnectSocket = isInitialized && !isLoading && (!currentSession || !status || status === 'DRAFT');

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initialize = async () => {
      setIsLoading(true);
      try {
        if (urlSessionId) {
          loadingSessionIdRef.current = urlSessionId;
          const session = await triageHistoryService.getSession(urlSessionId);
          setCurrentSession(session);
          loadingSessionIdRef.current = null;
        } else {
          const active = await triageHistoryService.getActiveSession();
          setCurrentSession(active);
        }
      } catch (error) {
        console.error("[useTriageSession] Init error:", error);
        setCurrentSession(null);
        loadingSessionIdRef.current = null;
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!hasInitializedRef.current) return;
    if (prevUrlSessionIdRef.current === urlSessionId) return;
    
    prevUrlSessionIdRef.current = urlSessionId;
    if (urlSessionId && loadingSessionIdRef.current !== urlSessionId) {
      loadSessionInternal(urlSessionId);
    }
  }, [urlSessionId]);

  const loadSessionInternal = useCallback(async (id: string) => {
    if (loadingSessionIdRef.current === id) return;
    
    loadingSessionIdRef.current = id;
    setIsLoading(true);
    try {
      const session = await triageHistoryService.getSession(id);
      setCurrentSession(session);
    } catch (error) {
      console.error("[useTriageSession] Load error:", error);
      throw error;
    } finally {
      setIsLoading(false);
      loadingSessionIdRef.current = null;
    }
  }, []);

  const loadSession = useCallback(async (id: string) => {
    if (currentSession?.sessionId === id) return;
    
    prevUrlSessionIdRef.current = id;
    const url = new URL(window.location.href);
    url.searchParams.set("session_id", id);
    window.history.pushState({}, "", url.toString());
    
    await loadSessionInternal(id);
  }, [currentSession?.sessionId, loadSessionInternal]);

  const loadActiveOrNew = useCallback(async () => {
    prevUrlSessionIdRef.current = null;
    const url = new URL(window.location.href);
    url.searchParams.delete("session_id");
    window.history.pushState({}, "", url.toString());

    setIsLoading(true);
    try {
      const active = await triageHistoryService.getActiveSession();
      if (active) {
        setCurrentSession(active);
      } else {
        tempSessionIdRef.current = generateUUID();
        setCurrentSession(null);
      }
    } catch (error) {
      console.error("[useTriageSession] loadActiveOrNew error:", error);
      tempSessionIdRef.current = generateUUID();
      setCurrentSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSessionFromResponse = useCallback((newSessionId: string) => {
    if (!currentSession) {
      setCurrentSession({
        sessionId: newSessionId,
        messages: [],
        status: 'DRAFT',
        userId: '',
        isComplete: false,
        isActive: true,
        messageCount: 0,
        updatedAt: new Date().toISOString(),
      } as TriageSessionResponse);
    }
  }, [currentSession]);

  const updateSessionStage = useCallback((newStage: string) => {
    setCurrentSession((prev) => {
      if (!prev) return prev;
      return { ...prev, currentStage: newStage };
    });
  }, []);

  return {
    currentSession,
    isLoading,
    sessionId,
    shouldConnectSocket,
    loadSession,
    loadActiveOrNew,
    updateSessionFromResponse,
    updateSessionStage,
  };
}

export default useTriageSession;
