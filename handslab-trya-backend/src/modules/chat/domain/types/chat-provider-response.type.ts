import { ChatResponseMessageDto } from '../../application/dtos/chat-response.dto';
import { ChatStage } from '../enums/chat-stage.enum';
import { ResponseStyle } from '../enums/response-style.enum';

export interface SummaryPresentationPatient {
  name?: string;
  priority?: string;
  clinical_description?: string;
}

export interface SummaryPresentation {
  patient?: SummaryPresentationPatient;
  symptoms?: string[];
  medications?: string[];
  critical_alert?: string;
}

export interface ChatProviderResponse {
  message: string;
  messages?: ChatResponseMessageDto[];
  session_id: string;
  is_complete: boolean;
  transcribed_text?: string;
  current_stage?: ChatStage;
}
