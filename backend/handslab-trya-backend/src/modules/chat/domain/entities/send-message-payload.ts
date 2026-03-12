import { ImagePayload } from './image-payload';

export interface OnboardDataPayload {
  chronicConditions: string[];
  medications: Array<{ name: string; dosage?: string }>;
  allergies?: string;
}

export interface SendMessagePayload {
  message: string;
  session_id: string;
  user_id: string;
  name: string;
  tenant_id: string;
  has_onboarded: boolean;
  audio?: string;
  audio_format?: string;
  images?: ImagePayload[];
  onboard_data?: OnboardDataPayload;
}
