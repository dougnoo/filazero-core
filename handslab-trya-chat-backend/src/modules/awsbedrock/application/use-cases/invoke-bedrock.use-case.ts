import { Injectable, Logger, Inject } from '@nestjs/common';
import { IBedrockClient } from '../../domain/interfaces/bedrock-client.interface';
import { IRateLimitService } from '../../domain/interfaces/rate-limit-service.interface';
import { BedrockRequest } from '../../domain/bedrock-request.entity';
import { BedrockResponse } from '../../domain/bedrock-response.entity';
import { InvokeAgentCommandOutput } from '@aws-sdk/client-bedrock-agent-runtime';
import { BEDROCK_CLIENT_TOKEN, RATE_LIMIT_SERVICE_TOKEN } from '../../tokens';
import { ProcessFunctionInvocationUseCase } from './process-function-invocation.use-case';

@Injectable()
export class InvokeBedrockUseCase {
  private readonly logger = new Logger(InvokeBedrockUseCase.name);

  constructor(
    @Inject(BEDROCK_CLIENT_TOKEN) private readonly bedrockClient: IBedrockClient,
    @Inject(RATE_LIMIT_SERVICE_TOKEN) private readonly rateLimitService: IRateLimitService,
    private readonly processFunctionInvocationUseCase: ProcessFunctionInvocationUseCase,
  ) {}

  async execute(request: BedrockRequest): Promise<BedrockResponse> {
    try {
      this.logger.debug(`Executing Bedrock request for session: ${request.sessionId}`);

      // Aplicar rate limiting
      await this.rateLimitService.enforceRateLimit(request.sessionId);

      // Executar requisição
      const response = await this.bedrockClient.sendRequest(
        request.sessionId,
        request.getProcessedPrompt(),
      );

      // Processar resposta
      return await this.processBedrockResponse(response, request.modelId, request.sessionId, null);
    } catch (error) {
      this.logger.error(`Failed to execute Bedrock request: ${error.message}`, error.stack);
      throw error;
    }
  }

  async executeForTenant(
    request: BedrockRequest, 
    tenantId: string,
    agentId?: string,
    agentAliasId?: string
  ): Promise<BedrockResponse> {
    try {
      this.logger.debug(`Executing Bedrock request for tenant ${tenantId}, session: ${request.sessionId}`);

      // Aplicar rate limiting específico do tenant
      await this.rateLimitService.enforceRateLimitForTenant(tenantId, request.sessionId);

      // Executar requisição com configurações específicas do tenant
      const response = await this.bedrockClient.sendRequestForTenant(
        tenantId,
        request.sessionId,
        request.getProcessedPrompt(),
      );

      // Processar resposta com tratamento de sessionId melhorado
      return await this.processBedrockResponse(response, request.modelId, request.sessionId, tenantId);
    } catch (error) {
      // Tratamento específico para erros de sessionId
      if (this.isSessionIdValidationError(error)) {
        this.logger.error(`🚨 SessionId ValidationException for tenant ${tenantId}`);
        this.logger.error(`📋 Problematic sessionId: ${request.sessionId}`);
        this.logger.error('💡 AWS Bedrock session expired or invalid');
        
        // Retornar resposta amigável ao usuário
        return BedrockResponse.create(
          'Desculpe, sua sessão expirou. Esta mensagem requer uma nova sessão para ser processada. Por favor, recarregue a página e tente novamente.',
          request.modelId
        );
      }
      
      this.logger.error(`Failed to execute Bedrock request for tenant ${tenantId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processBedrockResponse(response: InvokeAgentCommandOutput, modelId: string, sessionId: string, tenantId: string): Promise<BedrockResponse> {
    if (!response.completion) {
      throw new Error('No response from Bedrock agent');
    }

    // Extrair o texto da resposta processando os chunks
    const text = await this.extractTextFromResponse(response, sessionId, tenantId);

    return BedrockResponse.create(text, modelId);
  }

  private isSessionIdValidationError(error: any): boolean {
    return error.message && error.message.includes('sessionId') && 
           (error.message.includes('new or expired') || error.message.includes('invocationResults'));
  }

  private async extractTextFromResponse(response: InvokeAgentCommandOutput, sessionId: string, tenantId: string): Promise<string> {
    if (!response.completion) {
      throw new Error('No completion stream available in Bedrock response');
    }

    let extractedText = '';

    try {
      for await (const chunkEvent of response.completion) {
        // Processar chunks de texto
        if (chunkEvent.chunk) {
          const chunk = chunkEvent.chunk;
          if (chunk.bytes) {
            const decoded = new TextDecoder('utf-8').decode(chunk.bytes);
            extractedText += decoded;
            this.logger.debug('Chunk received:', decoded);
          }
        }

        // Processar eventos de returnControl (function calls)
        if (chunkEvent.returnControl) {
          this.logger.debug('ReturnControl event received:', chunkEvent.returnControl);
          await this.rateLimitService.enforceRateLimitForTenant(tenantId, sessionId);
          
          const result = await this.handleReturnControl(chunkEvent.returnControl, sessionId, tenantId);
          extractedText += result;
        }

        // Processar outros tipos de eventos básicos
        if (chunkEvent.trace) {
          this.logger.debug('Trace event received:', chunkEvent.trace);
        }

        if (chunkEvent.files) {
          this.logger.debug('Files event received:', chunkEvent.files);
        }
      }

      if (!extractedText.trim()) {
        this.logger.warn('No text content extracted from Bedrock response');
        return 'No response content available';
      }

      this.logger.debug(`Successfully extracted ${extractedText.length} characters from Bedrock response`);
      return extractedText.trim();

    } catch (error) {
      this.logger.error('Error processing Bedrock response stream:', error);
      
      // Tratamento específico para erros de sessionId
      if (this.isSessionIdValidationError(error)) {
        this.logger.error('🚨 SessionId ValidationException in main stream processing');
        this.logger.error(`📋 Problematic sessionId: ${sessionId}`);     
        
        // Retornar o texto extraído até agora, se houver
        if (extractedText.trim()) {
          this.logger.warn('⚠️ Returning partial response due to session expiration');
          return extractedText.trim() + ' [Sessão expirada durante processamento. Resposta pode estar incompleta.]';
        } else {
          // Se não há texto, retornar mensagem amigável
          this.logger.warn('⚠️ No text extracted due to session expiration');
          return 'Desculpe, a sessão expirou durante o processamento da sua solicitação. Por favor, tente novamente.';
        }
      }
      
      // Para outros erros, manter comportamento original
      console.error(error);
      throw new Error(`Failed to extract text from Bedrock response: ${error.message}`);
    }
  }

  /**
   * Processa respostas do Bedrock de forma iterativa para evitar recursão
   * Usa uma fila de processamento para lidar com múltiplas continuações
   */
  private async processResponseIteratively(
    initialResponse: InvokeAgentCommandOutput, 
    sessionId: string, 
    tenantId: string
  ): Promise<string> {
    const responseQueue: InvokeAgentCommandOutput[] = [initialResponse];
    let combinedText = '';
    let processedCount = 0;
    const maxIterations = 10; // Limite de segurança para evitar loops infinitos

    this.logger.debug(`🔄 Starting iterative response processing for session ${sessionId}`);

    while (responseQueue.length > 0 && processedCount < maxIterations) {
      const currentResponse = responseQueue.shift();
      processedCount++;

      this.logger.debug(`🔄 Processing response ${processedCount}/${maxIterations} for session ${sessionId}`);

      if (!currentResponse?.completion) {
        this.logger.warn(`⚠️ No completion stream in response ${processedCount}, skipping`);
        continue;
      }

      try {
        for await (const chunkEvent of currentResponse.completion) {
          // Processar chunks de texto
          if (chunkEvent.chunk?.bytes) {
            const decoded = new TextDecoder('utf-8').decode(chunkEvent.chunk.bytes);
            combinedText += decoded;
            this.logger.debug(`📝 Text chunk added (iteration ${processedCount}):`, decoded.substring(0, 100));
          }

          // Processar eventos de returnControl (function calls)
          if (chunkEvent.returnControl) {
            this.logger.debug(`🔧 ReturnControl event in iteration ${processedCount}:`, chunkEvent.returnControl);
            
            // Apply rate limiting for tenant before processing function
            if (tenantId) {
              await this.rateLimitService.enforceRateLimitForTenant(tenantId, sessionId);
            }

            try {
              const invocationId = chunkEvent.returnControl.invocationId;
              const invocationInputs = chunkEvent.returnControl.invocationInputs;
              
              if (!invocationInputs || invocationInputs.length === 0) {
                this.logger.error(`❌ No invocation inputs in iteration ${processedCount}`);
                continue;
              }

              const functionInvocationInput = invocationInputs[0].functionInvocationInput;
              const actionGroup = functionInvocationInput.actionGroup;
              const functionName = functionInvocationInput.function;
              const parameters = functionInvocationInput.parameters;

              this.logger.debug(`🔧 Processing function in iteration ${processedCount}:`, {
                invocationId,
                actionGroup,
                functionName,
                parameters
              });

              // Processar a função/ação
              const functionResult = await this.processFunctionInvocation(
                actionGroup,
                functionName,
                parameters
              );

              try {
                // Continuar a conversa com o resultado usando configuração do tenant (não recursivo)
                // IMPORTANTE: Não enviar inputText - o Agent continua automaticamente
                const continueResponse = await this.bedrockClient.sendRequestWithFunctionResultForTenant(
                  tenantId,
                  sessionId,
                  '', // Vazio para não quebrar histórico de conversa
                  invocationId,
                  actionGroup,
                  functionName,
                  functionResult,
                );

                // Adicionar resposta à fila para processamento iterativo
                if (continueResponse) {
                  responseQueue.push(continueResponse);
                  this.logger.debug(`➕ Added continuation response to queue (queue size: ${responseQueue.length})`);
                }
                
              } catch (continueError) {
                this.logger.error(`❌ Error continuing conversation in iteration ${processedCount}:`, continueError);
                
                // Check for specific ValidationException about sessionId
                if (this.isSessionIdValidationError(continueError)) {
                  this.logger.error(`🚨 SessionId ValidationException in iteration ${processedCount}`);
                  this.logger.error('🛑 Stopping iterative processing to avoid loops');
                  this.logger.error(`📋 Problematic sessionId: ${sessionId}`);
                  
                  // Extract function result summary for user feedback
                  let resultSummary = '';
                  if (functionResult) {
                    if (functionResult.protocolo) {
                      resultSummary += `Protocolo: ${functionResult.protocolo}. `;
                    }
                    if (functionResult.classificacao) {
                      resultSummary += `Classificação: ${functionResult.classificacao}. `;
                    }
                    if (functionResult.status) {
                      resultSummary += `Status: ${functionResult.status}. `;
                    }
                    if (functionResult.total_encontrados) {
                      resultSummary += `${functionResult.total_encontrados} locais encontrados. `;
                    }
                  }
                  
                  // Add function result summary to response and break loop
                  if (resultSummary.trim()) {
                    combinedText += ` ${resultSummary}Função executada com sucesso.`;
                  } else {
                    combinedText += ' [Função processada com sucesso.]';
                  }
                  
                  // Clear queue to stop processing
                  responseQueue.length = 0;
                  break;
                } else {
                  // For other errors, add generic error message
                  combinedText += ' [Erro no processamento da função. Processamento interrompido.]';
                }
              }

            } catch (error) {
              this.logger.error(`❌ Error processing returnControl in iteration ${processedCount}:`, error);
              combinedText += ' [Erro no processamento da função.]';
            }
          }

          // Processar outros tipos de eventos
          if (chunkEvent.trace) {
            this.logger.debug(`🔍 Trace event in iteration ${processedCount}:`, chunkEvent.trace);
          }

          if (chunkEvent.files) {
            this.logger.debug(`📁 Files event in iteration ${processedCount}:`, chunkEvent.files);
          }
        }

      } catch (error) {
        this.logger.error(`❌ Error processing iteration ${processedCount}:`, error);
        
        // Handle session validation errors
        if (this.isSessionIdValidationError(error)) {
          this.logger.error(`🚨 SessionId ValidationException in iteration ${processedCount}`);
          this.logger.error(`📋 Problematic sessionId: ${sessionId}`);
          
          if (combinedText.trim()) {
            this.logger.warn('⚠️ Returning partial response due to session expiration');
            combinedText += ' [Sessão expirada durante processamento iterativo.]';
          } else {
            this.logger.warn('⚠️ No text extracted due to session expiration');
            combinedText = 'Desculpe, a sessão expirou durante o processamento iterativo.';
          }
          
          // Clear queue to stop processing
          responseQueue.length = 0;
          break;
        }
        
        // For other errors, continue processing if possible
        this.logger.warn(`⚠️ Continuing with next response despite error in iteration ${processedCount}`);
      }
    }

    if (processedCount >= maxIterations) {
      this.logger.warn(`⚠️ Reached maximum iterations (${maxIterations}) for session ${sessionId}`);
      combinedText += ' [Processamento limitado para evitar loops infinitos.]';
    }

    this.logger.debug(`✅ Iterative processing completed: ${processedCount} iterations, ${combinedText.length} chars`);
    return combinedText.trim() || 'No content processed';
  }

  /**
   * Delega o processamento de funções para o use case específico
   * Princípio SOLID: Delegação para manter Single Responsibility
   */
  private async processFunctionInvocation(
    actionGroup: string,
    functionName: string,
    parameters: any,
  ): Promise<any> {
    // Delegar para o use case especializado
    const result = await this.processFunctionInvocationUseCase.execute(
      actionGroup,
      functionName,
      parameters,
    );

    // Retornar apenas os dados (não o wrapper completo)
    return result.data || result;
  }

  /**
   * Consolida todo o tratamento de returnControl sem try-catch aninhados
   */
  private async handleReturnControl(returnControl: any, sessionId: string, tenantId: string): Promise<string> {
    const invocationId = returnControl.invocationId;
    const invocationInputs = returnControl.invocationInputs;
    
    if (!invocationInputs || invocationInputs.length === 0) {
      this.logger.error('No invocation inputs found in returnControl');
      return ' [Erro: dados de função não encontrados]';
    }

    const functionInvocationInput = invocationInputs[0].functionInvocationInput;
    const actionGroup = functionInvocationInput.actionGroup;
    const functionName = functionInvocationInput.function;
    const parameters = functionInvocationInput.parameters;

    this.logger.debug('Processing returnControl:', {
      invocationId,
      actionGroup,
      functionName,
      parameters
    });

    // Processar a função/ação
    const functionResult = await this.processFunctionInvocation(actionGroup, functionName, parameters);
    
    // Tentar continuar a conversa com o resultado usando configuração do tenant
    // IMPORTANTE: inputText vazio para não quebrar histórico de conversa
    const continueResponse = await this.bedrockClient.sendRequestWithFunctionResultForTenant(
      tenantId,
      sessionId,
      '', // Vazio - o Agent continua automaticamente após receber o resultado
      invocationId,
      actionGroup,
      functionName,
      functionResult,
    )

    // Se conseguiu continuar, processar a resposta
    if (continueResponse && typeof continueResponse === 'object') {
      let additionalText =  await this.extractTextFromResponse(continueResponse, sessionId, tenantId);
      return additionalText;
    }
    
    // Se não conseguiu continuar, retornar o resultado da string de erro
    return typeof continueResponse === 'string' ? continueResponse : '';
  }

  /**
   * Extrai resumo do resultado da função para feedback do usuário
   */
  private extractFunctionResultSummary(functionResult: any): string {
    if (!functionResult) return ' [Função processada.]';
    
    let resultSummary = '';
    if (functionResult.protocolo) {
      resultSummary += `Protocolo: ${functionResult.protocolo}. `;
    }
    if (functionResult.classificacao) {
      resultSummary += `Classificação: ${functionResult.classificacao}. `;
    }
    if (functionResult.status) {
      resultSummary += `Status: ${functionResult.status}. `;
    }
    if (functionResult.total_encontrados) {
      resultSummary += `${functionResult.total_encontrados} locais encontrados. `;
    }
    
    return resultSummary.trim() 
      ? ` ${resultSummary}Função executada com sucesso.`
      : ' [Função processada com sucesso.]';
  }

}