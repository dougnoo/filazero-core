import {api} from "@/shared/services/api";
import type { BackendSummaryPresentation } from "@/shared/types/chat";

export type SessionStatus = "DRAFT" | "PENDING" | "COMPLETED";

export interface TriageHistoryItemResponse {
  sessionId: string;
  userId: string;
  status: SessionStatus;
  isComplete: boolean;
  isActive: boolean;
  messageCount: number;
  updatedAt: string;
  patientName?: string;
  summary?: string;
  firstUserMessage?: string;
  lastMessage?: string;
  symptoms?: string[];
  chiefComplaint?: string;
}

export interface TriageSessionMessage {
  type: string;
  content: string;
  timestamp?: string;
  style?: string | null;
  options?: string[];
  summaryPresentation?: BackendSummaryPresentation;
  specialty?: string;
  phase?: string;
  attachments?: Array<{
    name: string;
    link: string;
    extension: string;
    filename: string;
    size: string;
  }>;
}

export interface TriageSessionResponse {
  sessionId: string;
  userId: string;
  messages: TriageSessionMessage[];
  status: SessionStatus;
  isComplete: boolean;
  isActive: boolean;
  messageCount: number;
  createdAt?: string;
  updatedAt: string;
  patientName?: string;
  summary?: string;
  doctorAttachments?: Array<{
    name: string;
    filename: string;
    link: string;
    size: string;
    extension: string;
  }>;
  doctorName?: string;
  currentStage?: string;
}

export interface TriageHistoryResponse {
  items: TriageHistoryItemResponse[];
  total: number;
  page: number;
  limit: number;
}

class TriageHistoryService {
  async getHistory(page: number = 1, limit: number = 20): Promise<TriageHistoryResponse> {
    return await api.get<TriageHistoryResponse>(`/api/chat/history?page=${page}&limit=${limit}`);
  }

  async getSession(sessionId: string): Promise<TriageSessionResponse> {
    return await api.get<TriageSessionResponse>(`/api/chat/history/${sessionId}`);
  }

  async getActiveSession(): Promise<TriageSessionResponse | null> {
    try {
      return await api.get<TriageSessionResponse | null>("/api/chat/active-session");
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export const triageHistoryService = new TriageHistoryService();
