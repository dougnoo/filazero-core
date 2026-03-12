import { api } from '@/shared/services/api';
import { buildQueryParams } from '@/shared/utils';
import type { PaginatedTimeline, ListTimelineParams } from '../types/timeline.types';

const BASE_URL = '/api/timeline';

export const timelineService = {
  async list(params: ListTimelineParams): Promise<PaginatedTimeline> {
    const queryString = buildQueryParams({
      memberUserId: params.memberUserId,
      eventType: params.eventType,
      category: params.category,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      page: params.page,
      limit: params.limit,
    });

    return api.get<PaginatedTimeline>(`${BASE_URL}${queryString}`);
  },
};
