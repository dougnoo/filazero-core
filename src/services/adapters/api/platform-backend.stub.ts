/**
 * API Stub — platform-backend (handslab-trya-platform-backend)
 *
 * Manager analytics and operational intelligence.
 * NOT used in MVP1 — reserved for future manager dashboard.
 *
 * Target base URL: env.PLATFORM_BACKEND_URL
 */

import { platformApi } from '@/lib/api-client';
import { filtersToParams } from '@/domain/contracts/platform-backend';
import type {
  DashboardFilters,
  DashboardResponse,
  KPIsResponse,
  BottleneckDTO,
  WeeklyTrendDTO,
} from '@/domain/contracts/platform-backend';
import type { IDashboardService } from '../types';

const NOT_IMPL = (method: string) =>
  new Error(`[ApiStub] ${method} not implemented — connect platform-backend first`);

export class ApiDashboardService implements IDashboardService {
  /**
   * GET /api/manager/dashboard?municipalityId=X&unitId=Y&dateFrom=Z
   */
  async fetchDashboard(_filters?: DashboardFilters): Promise<DashboardResponse> {
    throw NOT_IMPL('ApiDashboardService.fetchDashboard');
    // TODO:
    // const qs = filtersToParams(filters ?? {}).toString();
    // const path = `/api/manager/dashboard${qs ? `?${qs}` : ''}`;
    // const { data } = await platformApi.get<DashboardResponse>(path);
    // return data;
  }

  async fetchKPIs(_filters?: DashboardFilters): Promise<KPIsResponse> {
    throw NOT_IMPL('ApiDashboardService.fetchKPIs');
  }

  async fetchBottlenecks(_filters?: DashboardFilters): Promise<BottleneckDTO[]> {
    throw NOT_IMPL('ApiDashboardService.fetchBottlenecks');
  }

  async fetchWeeklyTrend(_filters?: DashboardFilters, _weeks?: number): Promise<WeeklyTrendDTO[]> {
    throw NOT_IMPL('ApiDashboardService.fetchWeeklyTrend');
  }
}
