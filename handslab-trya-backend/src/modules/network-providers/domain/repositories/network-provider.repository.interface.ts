export const NETWORK_PROVIDER_REPOSITORY_TOKEN = Symbol(
  'NETWORK_PROVIDER_REPOSITORY_TOKEN',
);

export interface INetworkProviderRepository {
  getProviderNameByUserId(userId: string): Promise<string>;
  getProviderAndPlanNameByUserId(userId: string): Promise<{ providerName: string; planName: string }>;
}
