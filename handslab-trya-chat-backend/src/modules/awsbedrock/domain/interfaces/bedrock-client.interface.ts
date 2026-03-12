import { InvokeAgentCommandOutput } from '@aws-sdk/client-bedrock-agent-runtime';

export interface IBedrockClient {
  sendRequest(
    sessionId: string,
    inputText: string,
    agentId?: string,
    agentAliasId?: string,
    enableTrace?: boolean,
    endSession?: boolean,
  ): Promise<InvokeAgentCommandOutput>;

  sendRequestWithFunctionResult(
    sessionId: string,
    prompt: string,
    invocationId: string,
    actionGroup: string,
    functionName: string,
    functionResult: any,
  ): Promise<InvokeAgentCommandOutput>;

  // Métodos multi-tenant
  getTenantConfiguration(tenantId: string): Promise<{ agentId: string; agentAliasId: string }>;
  
  sendRequestForTenant(
    tenantId: string,
    sessionId: string,
    inputText: string,
    enableTrace?: boolean,
    endSession?: boolean,
  ): Promise<InvokeAgentCommandOutput>;

  sendRequestWithFunctionResultForTenant(
    tenantId: string,
    sessionId: string,
    prompt: string,
    invocationId: string,
    actionGroup: string,
    functionName: string,
    functionResult: any,
  ): Promise<InvokeAgentCommandOutput>;
}