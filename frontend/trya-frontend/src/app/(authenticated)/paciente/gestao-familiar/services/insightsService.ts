import { api } from '@/shared/services/api';
import type { HealthInsights } from '../types/insights.types';

const BASE_URL = '/api/insights';

export const insightsService = {
  async getHealthInsights(): Promise<HealthInsights> {
    const response = await api.get<HealthInsights>(`${BASE_URL}/health`);
    return response;
  },
};
