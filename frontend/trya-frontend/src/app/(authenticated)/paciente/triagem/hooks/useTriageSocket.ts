import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { CONNECTION_STATUS, type ConnectionStatus } from "@/shared/types/chat";

const RETRY_STRATEGY = {
  maxAttempts: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
} as const;

export interface UseTriageSocketOptions {
  sessionId: string;
  enabled: boolean;
}

export interface UseTriageSocketReturn {
  socketRef: React.RefObject<Socket | null>;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  lastError: string | null;
  reconnectAttempts: number;
  isTyping: boolean;
  setIsTyping: (value: boolean) => void;
}

function calculateBackoffDelay(attempt: number): number {
  const delay = RETRY_STRATEGY.initialDelay * Math.pow(RETRY_STRATEGY.backoffMultiplier, attempt);
  return Math.min(delay, RETRY_STRATEGY.maxDelay);
}

export function useTriageSocket(options: UseTriageSocketOptions): UseTriageSocketReturn {
  const { sessionId, enabled } = options;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(CONNECTION_STATUS.DISCONNECTED);
  const [lastError, setLastError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReconnectingRef = useRef<boolean>(false);
  const currentSessionIdRef = useRef<string>(sessionId);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const attemptReconnect = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || isReconnectingRef.current) return;

    setReconnectAttempts((prev) => {
      const newAttempts = prev + 1;
      if (newAttempts > RETRY_STRATEGY.maxAttempts) {
        setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
        isReconnectingRef.current = false;
        return prev;
      }

      const delay = calculateBackoffDelay(newAttempts - 1);
      setConnectionStatus(CONNECTION_STATUS.RECONNECTING);
      isReconnectingRef.current = true;

      clearReconnectTimeout();
      reconnectTimeoutRef.current = setTimeout(() => {
        if (socket && !socket.connected) {
          socket.connect();
        }
        isReconnectingRef.current = false;
      }, delay);

      return newAttempts;
    });
  }, [clearReconnectTimeout]);

  const createSocket = useCallback((currentSessionId: string): Socket | null => {
    if (!token) return null;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const socketUrl = `${baseUrl.replace(/\/$/, "")}/chat`;
    const cleanToken = token.replace("Bearer ", "");

    const socket = io(socketUrl, {
      path: "/socket.io",
      extraHeaders: { Authorization: `Bearer ${cleanToken}` },
      query: { token: cleanToken, sessionId: currentSessionId },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      setConnectionStatus(CONNECTION_STATUS.CONNECTED);
      setLastError(null);
      setReconnectAttempts(0);
      isReconnectingRef.current = false;
      clearReconnectTimeout();
    });

    socket.on("disconnect", (reason: string) => {
      setIsTyping(false);
      const shouldReconnect = ["io server disconnect", "transport close", "transport error", "ping timeout"].includes(reason);
      if (shouldReconnect) {
        attemptReconnect();
      } else {
        setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      }
    });

    socket.on("connect_error", (error: Error) => {
      setLastError(error.message);
      attemptReconnect();
    });

    const manager = socket.io;
    if (manager) {
      manager.on("reconnect_attempt", (attemptNumber: number) => {
        setConnectionStatus(CONNECTION_STATUS.RECONNECTING);
        setReconnectAttempts(attemptNumber);
      });

      manager.on("reconnect", () => {
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        setLastError(null);
        setReconnectAttempts(0);
        isReconnectingRef.current = false;
        clearReconnectTimeout();
      });

      manager.on("reconnect_error", (error: Error) => {
        setLastError(error.message);
      });

      manager.on("reconnect_failed", () => {
        setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
        isReconnectingRef.current = false;
      });
    }

    return socket;
  }, [token, attemptReconnect, clearReconnectTimeout]);

  // Reset isTyping when session changes
  useEffect(() => {
    if (currentSessionIdRef.current !== sessionId) {
      setIsTyping(false);
      currentSessionIdRef.current = sessionId;
    }
  }, [sessionId]);

  // Socket connection management
  useEffect(() => {
    if (!enabled) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
        setIsTyping(false);
      }
      clearReconnectTimeout();
      return;
    }

    if (!token || !sessionId) return;

    const needsNewSocket = !socketRef.current || currentSessionIdRef.current !== sessionId;
    
    if (needsNewSocket) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      currentSessionIdRef.current = sessionId;
      setIsTyping(false);
      const socket = createSocket(sessionId);
      if (socket) {
        socketRef.current = socket;
      }
    }
  }, [token, enabled, sessionId, createSocket, clearReconnectTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    socketRef,
    isConnected: connectionStatus === CONNECTION_STATUS.CONNECTED,
    connectionStatus,
    lastError,
    reconnectAttempts,
    isTyping,
    setIsTyping,
  };
}

export default useTriageSocket;
