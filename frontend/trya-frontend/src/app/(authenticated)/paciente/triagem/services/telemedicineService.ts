import { api } from '@/shared/services/api';

interface MagicLinkResponse {
  magicLink: string;
  expiresAt: string;
  message: string;
}

export const telemedicineService = {
  async getMagicLink(): Promise<string> {
    const response = await api.post<MagicLinkResponse>('/api/integrations/telemedicine/magic-link');
    return response.magicLink;
  },
};