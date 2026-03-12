export interface IPlanManagementService {
  getOrCreatePlan(planName: string): Promise<string>;
}
