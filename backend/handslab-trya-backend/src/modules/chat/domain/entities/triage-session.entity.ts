import { MessagePhase } from '../../application/dtos/chat-response.dto';
import { ResponseStyle } from '../enums/response-style.enum';
import { SummaryPresentation } from '../types/chat-provider-response.type';
import { SessionStatus } from '../value-objects/session-status.enum';

export interface TriageMessage {
  type: 'HumanMessage' | 'AIMessage' | 'SystemMessage' | 'DoctorMessage';
  content: string;
  timestamp: string;
  attachments?: DoctorAttachment[];
  specialty?: string;
  style: ResponseStyle;
  phase?: MessagePhase;
  options?: string[]; // Para mensagens do tipo 'multiple' ou 'single'
  summaryPresentation?: SummaryPresentation;
  hasSummaryPresentation?: boolean;
}

export interface DoctorAttachment {
  name: string;
  filename: string;
  link: string;
  size?: string;
  extension: string;
}

export class TriageSession {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly messages: TriageMessage[],
    public readonly status: SessionStatus,
    public readonly isComplete: boolean,
    public readonly updatedAt: Date,
    public readonly patientName?: string,
    public readonly summary?: string,
    public readonly doctorAttachments?: DoctorAttachment[],
    public readonly doctorName?: string,
    public readonly symptoms?: string[],
    public readonly chiefComplaint?: string,
    public readonly currentStage?: string,
    public readonly specialty?: string,
    public readonly hasSummaryPresentation?: boolean,
  ) {}

  get isActive(): boolean {
    return this.status === SessionStatus.DRAFT;
  }

  get messageCount(): number {
    return this.messages.length;
  }
}
