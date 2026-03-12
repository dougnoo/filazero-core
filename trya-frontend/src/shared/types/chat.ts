// Constantes de estilos de mensagem
export const MESSAGE_STYLES = {
  TEXT: 'text',
  SCALE: 'scale',
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  SUMMARY: 'summary',
  EXAM: 'exam',
  SEARCH_MEDICAL_SERVICE: 'searchMedicalService',
  EMERGENCY: 'emergency',
  TELEMEDICINE: 'telemedicine'
} as const;

// Estilos de mensagem suportados
export type MessageStyle = typeof MESSAGE_STYLES[keyof typeof MESSAGE_STYLES] | null;

// Constantes de status de envio
export const MESSAGE_SEND_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  ERROR: 'error'
} as const;

// Status de envio da mensagem
export type MessageSendStatus = typeof MESSAGE_SEND_STATUS[keyof typeof MESSAGE_SEND_STATUS];

// Constantes de status de conexão
export const CONNECTION_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting'
} as const;

// Status de conexão
export type ConnectionStatus = typeof CONNECTION_STATUS[keyof typeof CONNECTION_STATUS];

// Apresentação do resumo
export interface SummaryPresentation {
  patient: {
    name: string;
    priority: string;
    clinicalDescription: string;
  };
  symptoms: string[];
  medications: string[];
  activeHistory?: string[];
  criticalAlerts?: string[];
}

// Formato de SummaryPresentation como vem do backend (pode ser nested ou flat)
export interface BackendSummaryPresentation {
  // Nested format (actual backend format)
  patient?: {
    name?: string;
    priority?: string;
    clinical_description?: string;
  };
  symptoms?: string[];
  medications?: string[];
  active_history?: string[];
  critical_alert?: string | null;
  // Flat format (legacy)
  patientName?: string;
  priority?: string;
  priorityColor?: string;
  clinicalDescription?: string;
  activeHistory?: string[];
  criticalAlerts?: string[];
}

// Mensagem individual do backend
export interface BackendMessage {
  type?: string;
  content: string | null;
  timestamp: string;
  phase: string;
  style: MessageStyle;
  options?: string[];
  summaryPresentation?: BackendSummaryPresentation;
  specialty?: string;
  attachments?: MessageAttachment[];
}

// Resposta completa do backend
export interface BackendResponse {
  is_complete: boolean;
  message: string;
  messages?: BackendMessage[];
  session_id: string;
  current_stage: string;
  status?: string;
  error?: string;
}

// Tipo para anexos do médico
export interface DoctorAttachment {
  name: string;
  filename: string;
  link: string;
  size: string;
  extension: string;
}

// Tipo para anexos inline nas mensagens (novo formato)
export interface MessageAttachment {
  name: string;
  link: string;
  extension: string;
  filename: string;
  size: string;
}

// Tipo para metadados da mensagem
export interface MessageMetadata {
  confidence?: number;
  category?: string;
  urgency?: "low" | "medium" | "high";
  recommendations?: string[];
}

// Mensagem do chat (atualizada)
export interface Message {
  id: string;
  type: "text" | "audio" | "file";
  content: string;
  sender: "bot" | "user" | "doctor";
  timestamp: string;

  // Novos campos para estilos
  style?: MessageStyle;
  options?: string[];
  summaryPresentation?: SummaryPresentation;
  specialty?: string;
  phase?: string;

  // Campos para mensagens interativas já respondidas
  isAnswered?: boolean; // Se a mensagem interativa já foi respondida
  userResponse?: string | number | string[]; // A resposta do usuário (texto, número para scale, ou array para multiple)

  // Status de envio
  sendStatus?: MessageSendStatus;

  // Campos existentes mantidos
  doctorName?: string; // Nome do médico para mensagens do tipo doctor
  fileSize?: string;
  duration?: string;
  audioUrl?: string;
  audioMimeType?: string;
  transcription?: string;
  fileType?: string;
  fileUrl?: string;
  doctorAttachments?: DoctorAttachment[];
  attachments?: MessageAttachment[]; // Novo: attachments inline na mensagem
  metadata?: MessageMetadata;
}

export interface AudioRecording {
  blob: Blob;
  url: string;
  duration: number;
}

