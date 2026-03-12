export interface ChatMessagePayloadDto {
  message: string;
  session_id: string;
  audio?: string;
  audio_format?: string;
  files?: Array<{ data: string; type: string; name: string }>;
}
