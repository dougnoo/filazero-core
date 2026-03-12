import { OnboardData } from '../../domain/value-objects/onboard-data.value-object';

export class SendMessageDto {
  message: string;
  sessionId: string;
  userId: string;
  userName: string;
  tenantId: string;
  audio?: string;
  audioFormat?: string;
  files?: Array<{ data: string; type: string; name: string }>;
  onboardData?: OnboardData;
  hasOnboarded: boolean;

  private constructor(data: Partial<SendMessageDto>) {
    Object.assign(this, data);
  }

  static create(data: Partial<SendMessageDto>): SendMessageDto {
    return new SendMessageDto(data);
  }
}
