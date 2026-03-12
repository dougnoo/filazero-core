import { 
  BedrockAgentRuntimeClient, 
  InvokeAgentCommand, 
  InvokeAgentCommandOutput 
} from '@aws-sdk/client-bedrock-agent-runtime';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IBedrockClient } from '../domain/interfaces/bedrock-client.interface';
import { TenantService } from '../../tenant/tenant.service';

@Injectable()
export class BedrockClientAdapter implements IBedrockClient {
  private readonly logger = new Logger(BedrockClientAdapter.name);
  private readonly client: BedrockAgentRuntimeClient;
  private readonly defaultAgentId: string;
  private readonly defaultAgentAliasId: string;

  constructor(
    private configService: ConfigService,
    private tenantService: TenantService,
  ) {
    const region = this.configService.get<string>('AWS_REGION');
    const runtime = this.configService.get<string>('AWS_RUNTIME', 'aws');
    const profile = this.configService.get<string>('AWS_PROFILE', 'default');

    // Configurações padrão (fallback para single-tenant ou desenvolvimento)
    this.defaultAgentId = this.configService.get<string>('AWS_AGENT_ID');
    this.defaultAgentAliasId = this.configService.get<string>('AWS_AGENT_ALIAS_ID');

    if (runtime === 'local') {
      this.client = new BedrockAgentRuntimeClient({
        region: region,
        profile: profile,
      });
    } else {
      this.client = new BedrockAgentRuntimeClient({ region: region });
    }
  }

  async sendRequest(
    sessionId: string,
    inputText: string,
    agentId?: string,
    agentAliasId?: string,
    enableTrace?: boolean,
    endSession?: boolean,
  ): Promise<InvokeAgentCommandOutput> {
    try {
      const effectiveAgentId = agentId || this.defaultAgentId;
      const effectiveAgentAliasId = agentAliasId || this.defaultAgentAliasId;

      this.logger.debug(`Invoking Bedrock Agent: ${effectiveAgentId} (alias: ${effectiveAgentAliasId})`);
      
      const command = new InvokeAgentCommand({
        agentId: effectiveAgentId,
        agentAliasId: effectiveAgentAliasId,
        sessionId: sessionId,
        inputText: inputText,
        enableTrace: enableTrace,
        endSession: endSession,
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      this.logger.error(`Bedrock Agent invocation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendRequestWithFunctionResult(
    sessionId: string,
    prompt: string, // Este parâmetro não será usado quando há returnControlInvocationResults
    invocationId: string,
    actionGroup: string,
    functionName: string,
    functionResult: any,
  ): Promise<InvokeAgentCommandOutput> {
    try {
      this.logger.debug(`Sending function result to Bedrock Agent`, {
        sessionId,
        invocationId,
        actionGroup,
        functionName
      });

      // Serializar resultado da função de forma segura
      const serializedResponse = this.safeSerialize(functionResult);
      
      // Formato exato que o AWS Bedrock Agent espera
      const responseBody = {
        'TEXT': {
          'body': serializedResponse
        }
      };
      
      this.logger.debug('📤 Function result response body:', responseBody);
      
      // IMPORTANTE: Quando enviamos returnControlInvocationResults,
      // NÃO devemos enviar inputText para não quebrar o histórico de conversa
      const command = new InvokeAgentCommand({
        agentAliasId: this.defaultAgentAliasId,
        agentId: this.defaultAgentId,
        sessionId: sessionId,
        // inputText: NÃO ENVIAR - causaria ValidationException
        sessionState: {
          invocationId: invocationId,
          returnControlInvocationResults: [
            {
              functionResult: {
                function: functionName,
                actionGroup: actionGroup,
                responseBody: responseBody,
              },
            },
          ],
        },
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      this.logger.error(`Bedrock Agent function result invocation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtém configurações específicas do tenant
   * Usa o TenantService para centralizar a lógica de tenant
   */
  async getTenantConfiguration(tenantId: string): Promise<{ agentId: string; agentAliasId: string }> {
    try {
      const tenantConfig = await this.tenantService.getTenantConfig(tenantId);
      
      this.logger.debug(`✅ Using tenant ${tenantId} specific configuration: ${tenantConfig.awsAgentId} (${tenantConfig.awsAgentAliasId})`);
      
      return {
        agentId: tenantConfig.awsAgentId,
        agentAliasId: tenantConfig.awsAgentAliasId
      };
    } catch (error) {
      this.logger.warn(`⚠️ Tenant ${tenantId} configuration not found, using default configuration: ${error.message}`);
      
      return {
        agentId: this.defaultAgentId,
        agentAliasId: this.defaultAgentAliasId
      };
    }
  }

  /**
   * Método para enviar request com configuração específica do tenant
   */
  async sendRequestForTenant(
    tenantId: string,
    sessionId: string,
    inputText: string,
    enableTrace?: boolean,
    endSession?: boolean,
  ): Promise<InvokeAgentCommandOutput> {
    const tenantConfig = await this.getTenantConfiguration(tenantId);
    
    return this.sendRequest(
      sessionId,
      inputText,
      tenantConfig.agentId,
      tenantConfig.agentAliasId,
      enableTrace,
      endSession
    );
  }

  /**
   * Método para enviar function result com configuração específica do tenant
   */
  async sendRequestWithFunctionResultForTenant(
    tenantId: string,
    sessionId: string,
    prompt: string, // Este parâmetro não será usado quando há returnControlInvocationResults
    invocationId: string,
    actionGroup: string,
    functionName: string,
    functionResult: any,
  ): Promise<InvokeAgentCommandOutput> {
    const tenantConfig = await this.getTenantConfiguration(tenantId);
    
    try {
      this.logger.debug(`Sending function result to Bedrock Agent for tenant ${tenantId}`, {
        sessionId,
        invocationId,
        actionGroup,
        functionName,
        agentId: tenantConfig.agentId,
        agentAliasId: tenantConfig.agentAliasId
      });

      // Serializar resultado da função de forma segura
      const serializedResponse = this.safeSerialize(functionResult);
      
      // Formato exato que o AWS Bedrock Agent espera
      const responseBody = {
        'TEXT': {
          'body': serializedResponse
        }
      };
      
      this.logger.debug('📤 Function result response body:', responseBody);
      
      // IMPORTANTE: Quando enviamos returnControlInvocationResults,
      // NÃO devemos enviar inputText para não quebrar o histórico de conversa
      // O Agent continua a conversa automaticamente após receber o resultado da função
      const command = new InvokeAgentCommand({
        agentAliasId: tenantConfig.agentAliasId,
        agentId: tenantConfig.agentId,
        sessionId: sessionId,
        // inputText: NÃO ENVIAR - causaria ValidationException sobre histórico de conversa
        sessionState: {
          invocationId: invocationId,
          returnControlInvocationResults: [
            {
              functionResult: {
                function: functionName,
                actionGroup: actionGroup,
                responseBody: responseBody,
              },
            },
          ],
        },
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      this.logger.error(`Bedrock Agent function result invocation failed for tenant ${tenantId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private safeSerialize(obj: any, maxLength: number = 200): string {
    try {
      this.logger.debug(`🔧 Gerando resposta ultra-simples para Bedrock`);
      
      // TEXTO PURO sem JSON complexo - formato que o Bedrock sempre aceita
      if (obj && (obj.status || obj.protocolo || obj.classificacao)) {
        return `Status: ${obj.status || 'OK'}. ${obj.protocolo ? `Protocolo: ${obj.protocolo}. ` : ''}${obj.classificacao ? `Classificação: ${obj.classificacao}.` : ''}`;
      }
      
      // Fallback ainda mais simples
      const fallbackText = 'Função executada com sucesso.';
      this.logger.debug(`🔧 Texto fallback: ${fallbackText}`);
      return fallbackText;
      
    } catch (err) {
      this.logger.error('🚨 Erro na serialização:', err);
      // Fallback de emergência - texto puro garantido
      return 'Processamento concluído.';
    }
  }
}