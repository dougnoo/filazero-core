import { ChatStage } from '../../domain/enums/chat-stage.enum';
import { ResponseStyle } from '../../domain/enums/response-style.enum';

export enum MessagePhase {
  INTRO = 'intro',
  QUESTION = 'question',
  ERROR = 'error',
  CLOSING = 'closing',
}

export class ChatResponseMessageDto {
  content: string;
  timestamp: Date;
  phase: MessagePhase;
  style?: ResponseStyle;
  options?: string[] | null;
  specialty?: string;
  hasSummary?: boolean;
  summaryPresentation?: {
    patient?: {
      name?: string;
      priority?: string;
      clinicalDescription?: string;
    };
    symptoms?: string[];
    medications?: string[];
    criticalAlert?: string;
  };
}

export class ChatResponseDto {
  message: string;
  messages: ChatResponseMessageDto[];
  sessionId: string;
  isComplete: boolean;
  transcribedText?: string;
  currentStage?: ChatStage;

  private constructor(data: Partial<ChatResponseDto>) {
    Object.assign(this, data);
  }

  static fromProviderResponse(response: any): ChatResponseDto {
    return new ChatResponseDto({
      message: response.message,
      messages: response.messages.map((msg: any) => ({
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        phase: msg.phase,
        style: msg.style,
        options: msg.options || null,
        specialty: msg.specialty,
        hasSummary: msg.has_summary,
        summaryPresentation: msg.summary_presentation
          ? {
              patient: msg.summary_presentation.patient
                ? {
                    name: msg.summary_presentation.patient.name,
                    priority: msg.summary_presentation.patient.priority,
                    clinicalDescription:
                      msg.summary_presentation.patient.clinical_description,
                  }
                : undefined,
              symptoms: msg.summary_presentation.symptoms || undefined,
              medications: msg.summary_presentation.medications || undefined,
              criticalAlert:
                msg.summary_presentation.critical_alert || undefined,
            }
          : undefined,
      })),
      sessionId: response.session_id,
      isComplete: response.is_complete,
      transcribedText: response.transcribed_text,
      currentStage: response.current_stage,
    });
  }
}
