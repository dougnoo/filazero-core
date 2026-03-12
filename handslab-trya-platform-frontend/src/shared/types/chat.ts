export interface Message {
  id: string;
  type: "text" | "audio" | "file";
  content: string;
  sender: "bot" | "user";
  timestamp: string;
  fileSize?: string;
  duration?: string;
  audioUrl?: string;
  audioMimeType?: string;
  transcription?: string;
  fileType?: string; // MIME type of the file (e.g., "image/png", "application/pdf")
  fileUrl?: string; // URL for preview (for images)
  metadata?: {
    confidence?: number;
    category?: string;
    urgency?: "low" | "medium" | "high";
    recommendations?: string[];
  };
}

export interface TriageResult {
  protocolo: string;
  classificacao: "AZUL" | "VERDE" | "AMARELO" | "LARANJA" | "VERMELHO" | string;
  prioridade?: string;
  tempo_espera_estimado?: string;
  recomendacoes?: string[];
  observacoes?: string;
  status?: string;
  timestamp?: string;
}

export interface ChatAPIRequest {
  message: string;
  model?: string;
  session_id: string; // Backend expects session_id (snake_case)
  audioData?: string;
  audioMimeType?: string;
}

export interface ChatAPIResponse {
  data?: {
    answer?: string;
  };
  answer?: string;
  text?: string;
  message?: string;
  error?: string;
}

export interface AudioRecording {
  blob: Blob;
  url: string;
  duration: number;
}

