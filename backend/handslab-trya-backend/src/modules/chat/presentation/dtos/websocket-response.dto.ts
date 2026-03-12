import { ChatResponseMessageDto } from '../../application/dtos/chat-response.dto';
import { ChatStage } from '../../domain/enums/chat-stage.enum';
import { ResponseStyle } from '../../domain/enums/response-style.enum';

export class WebSocketResponseDto {
  is_complete: boolean;
  message: string;
  messages: ChatResponseMessageDto[];
  session_id: string;
  transcribed_text?: string;
  current_stage?: ChatStage;
  style?: ResponseStyle;
  options?: string[] | null;
  specialty?: string;
  summaryBeneficiary?: {
    patient?: {
      name?: string;
      priority?: string;
      clinicalDescription?: string;
    };
    symptoms?: any;
    medications?: any;
    criticalAlert?: any;
  };
}
