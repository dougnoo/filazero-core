import { BedrockRequest } from '../bedrock-request.entity';
import { BedrockResponse } from '../bedrock-response.entity';
import { TenantConfig } from '../../../tenant/tenant.service';

export interface IBedrockService {
  invoke(request: BedrockRequest): Promise<BedrockResponse>;
  invokeForTenant(tenantConfig: TenantConfig, request: BedrockRequest): Promise<BedrockResponse>;
}