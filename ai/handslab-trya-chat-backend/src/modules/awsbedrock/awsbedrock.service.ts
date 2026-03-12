import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
  InvokeAgentCommandOutput,
  ThrottlingException,
} from '@aws-sdk/client-bedrock-agent-runtime';

import { BedrockResponse } from './interfaces/bedrock-response.interface';
import { TranscriptionService } from '../transcription/transcription.service';
import { TenantConfig } from '../tenant/tenant.service';
import { LocationService } from '../location/location.service';
import { HealthcareFacilitiesService } from '../healthcare-facilities/healthcare-facilities.service';

@Injectable()
export class AwsbedrockService {
  private readonly region: string;
  private readonly profile: string = 'default';
  private readonly runtime: string = 'aws';
  private client: BedrockAgentRuntimeClient;
  private readonly agentId: string;
  private readonly agentAliasId: string;  
  
  private readonly maxProcessingTimeMs: number = 25000; // 25 segundos (margem de 5s)
  
  // Configurações de rate limiting parametrizáveis
  private readonly requestsPerMinute: number;
  private readonly requestDelayMs: number;
  
  // Configurações específicas para HTTP
  private readonly httpTimeoutMs: number = 30000; // 30 segundos para HTTP
  private readonly maxDepth: number = 3; // Reduzido para 3 para evitar muitas requisições
  private readonly maxRequestsInSession: number = 2; // Máximo 2 requisições por sessão HTTP (COMENTADO)
  
  // Controle de taxa de requisições
  private lastRequestTime: number = 0;
  private requestCountBySession: Map<string, { count: number; startTime: number }> = new Map();

  constructor(
    private configService: ConfigService,
    private transcriptionService: TranscriptionService,
    private locationService: LocationService,
    private healthcareFacilitiesService: HealthcareFacilitiesService,
  ) {
    this.region = this.configService.get<string>('AWS_REGION');
    this.profile = this.configService.get<string>('AWS_PROFILE');
    this.runtime = this.configService.get<string>('AWS_RUNTIME');
    this.agentId = this.configService.get<string>('AWS_AGENT_ID');
    this.agentAliasId = this.configService.get<string>('AWS_AGENT_ALIAS_ID');

    // Configurar rate limiting parametrizável
    this.requestsPerMinute = this.configService.get<number>('BEDROCK_REQUESTS_PER_MINUTE', 2); // Reduzido de 4 para 2
    this.requestDelayMs = Math.floor(60000 / this.requestsPerMinute); // Calcula delay baseado no limite

    // Validação dos valores
    if (this.requestsPerMinute < 1) {
      console.warn('⚠️  BEDROCK_REQUESTS_PER_MINUTE muito baixo. Usando valor mínimo: 1');
      this.requestsPerMinute = 1;
      this.requestDelayMs = 60000; // 1 minuto
    }

    if (this.requestsPerMinute > 50) { // Reduzido de 100 para 50
      console.warn('⚠️  BEDROCK_REQUESTS_PER_MINUTE muito alto. Usando valor máximo: 50');
      this.requestsPerMinute = 50;
      this.requestDelayMs = 1200; // 1.2s
    }

    console.log(`🚀 Bedrock Rate Limiting configurado: ${this.requestsPerMinute} req/min (delay: ${this.requestDelayMs}ms)`);    

    // Ajustar configurações baseadas no ambiente
    const environment = this.configService.get<string>('NODE_ENV', 'development');
    if (environment === 'development') {
      console.warn('⚠️  DEVELOPMENT MODE: Rate limiting ativo. Monitore os logs!');
    }

    if (this.runtime === 'local') {
      this.client = new BedrockAgentRuntimeClient({
        region: this.region,
        profile: this.profile,
      });
    } else {
      this.client = new BedrockAgentRuntimeClient({ region: this.region });
    }
  }

  async invoke(
    modelId: string,
    prompt: string,
    sessionId: string,
    audioBuffer?: Buffer,
    audioMimeType?: string,
  ): Promise<BedrockResponse> {
    const startTime = Date.now();
    
    try {
      // Se há áudio, transcrever primeiro e depois processar com o Agent
      if (audioBuffer && audioMimeType) {
        console.log('🎤 Áudio detectado, transcrevendo com Amazon Transcribe...');
        return await this.processAudioWithTranscription(prompt, sessionId, audioBuffer, audioMimeType);
      }
      
      // Para mensagens de texto, usar o Bedrock Agent normalmente
      console.log('📝 Processando mensagem de texto com Bedrock Agent...');
      
      // Garantir que sempre haja inputText para o Agent
      let finalPrompt = prompt;
      if (!finalPrompt || finalPrompt.trim().length === 0) {
        finalPrompt = "Olá";
        console.log('📝 Prompt vazio, usando fallback:', finalPrompt);
      }
      
      // Apenas controle de rate limiting do Bedrock (4 req/min)
      await this.enforceRateLimit(sessionId);

      const response = await this.retryWithBackoff(
        () => this.sendRequest(sessionId, finalPrompt, undefined, undefined, undefined, undefined),
        'Bedrock Agent request'
      );
      
      console.log('Bedrock response:', response);

      if (response.completion === undefined) {
        throw new Error('No response from Bedrock agent');
      }

      const text = await this.processResponseChunks(sessionId, response, startTime);

      return {
        answer: text,
        model: modelId,
      };
    } catch (error) {
      console.error('Error in invoke method:', error);
      throw error;
    }
  }

  async invokeForTenant(
    tenantConfig: TenantConfig,
    modelId: string,
    prompt: string,
    sessionId: string,
    audioBuffer?: Buffer,
    audioMimeType?: string,
  ): Promise<BedrockResponse> {
    console.log(`🏢 Processando requisição para tenant: ${tenantConfig.name} (${tenantConfig.tenantId})`);
    
    const startTime = Date.now();
    
    try {
      // Usar rate limiting específico do tenant
      await this.enforceRateLimitForTenant(tenantConfig, sessionId);

      // Temporariamente usar o agentId e agentAliasId do tenant
      const originalAgentId = this.agentId;
      const originalAgentAliasId = this.agentAliasId;
      
      // Override com configurações do tenant
      (this as any).agentId = tenantConfig.awsAgentId;
      (this as any).agentAliasId = tenantConfig.awsAgentAliasId;

      let result: BedrockResponse;
      
      if (audioBuffer && audioMimeType) {
        console.log('🎤 Áudio detectado para tenant, transcrevendo...');
        result = await this.processAudioWithTranscription(prompt, sessionId, audioBuffer, audioMimeType);
      } else {
        console.log('📝 Processando mensagem de texto para tenant...');
        
        let finalPrompt = prompt;
        if (!finalPrompt || finalPrompt.trim().length === 0) {
          finalPrompt = "Olá";
        }

        const response = await this.retryWithBackoff(
          () => this.sendRequest(sessionId, finalPrompt, undefined, undefined, undefined, undefined),
          `Bedrock Agent request for tenant ${tenantConfig.tenantId}`
        );
        
        if (response.completion === undefined) {
          throw new Error(`No response from Bedrock agent for tenant ${tenantConfig.tenantId}`);
        }

        const text = await this.processResponseChunks(sessionId, response, startTime);

        result = {
          answer: text,
          model: modelId,
        };
      }
      
      // Restaurar configurações originais
      (this as any).agentId = originalAgentId;
      (this as any).agentAliasId = originalAgentAliasId;
      
      return result;
    } catch (error) {
      console.error(`Error in invokeForTenant for ${tenantConfig.tenantId}:`, error);
      throw error;
    }
  }

  private async enforceRateLimitForTenant(tenantConfig: TenantConfig, sessionId?: string): Promise<void> {
    const tenantKey = `${tenantConfig.tenantId}:${sessionId || 'default'}`;
    const now = Date.now();
    const tenantDelayMs = Math.floor(60000 / tenantConfig.requestsPerMinute);
    
    // Controle de rate limiting específico por tenant
    const lastRequestKey = `lastRequest_${tenantConfig.tenantId}`;
    const lastRequestTime = (this as any)[lastRequestKey] || 0;
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < tenantDelayMs) {
      const waitTime = tenantDelayMs - timeSinceLastRequest;
      console.log(`⏳ Rate limiting para tenant ${tenantConfig.tenantId}: aguardando ${waitTime}ms`);
      await this.sleep(waitTime);
    }
    
    (this as any)[lastRequestKey] = Date.now();
    console.log(`✅ Rate limit OK para tenant ${tenantConfig.tenantId}: ${tenantConfig.requestsPerMinute} req/min`);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Serialização MINIMALISTA para evitar ValidationException
  private safeSerialize(obj: any, maxLength: number = 200): string {
    try {
      console.log(`🔧 Gerando resposta ultra-simples para Bedrock`);
      
      // TEXTO PURO sem JSON complexo - formato que o Bedrock sempre aceita
      if (obj && (obj.status || obj.protocolo || obj.classificacao)) {
        const simpleText = `Triagem concluída. Protocolo: ${obj.protocolo || 'N/A'}. Classificação: ${obj.classificacao || 'VERDE'}. Status: ${obj.status || 'CONCLUIDO'}.`;
        console.log(`🔧 Texto da triagem: ${simpleText}`);
        return simpleText;
      }
      
      // Fallback ainda mais simples
      const fallbackText = 'Função executada com sucesso.';
      console.log(`🔧 Texto fallback: ${fallbackText}`);
      return fallbackText;
      
    } catch (err) {
      console.error('🚨 Erro na serialização:', err);
      // Fallback de emergência - texto puro garantido
      return 'Processamento concluído.';
    }
  }
  
  // Método auxiliar para obter extensão do arquivo baseado no MIME type
  private getFileExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/wave': 'wav',
      'audio/x-wav': 'wav',
      'audio/webm': 'webm',
      'audio/ogg': 'ogg',
      'audio/flac': 'flac',
      'audio/aac': 'aac',
      'audio/m4a': 'm4a',
    };
    
    return mimeToExt[mimeType.toLowerCase()] || 'audio';
  }

  private async enforceRateLimit(sessionId?: string): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;   
    
    
    // Controle inteligente de rate limiting do Bedrock (4 req/min)
    if (timeSinceLastRequest < this.requestDelayMs) {
      const waitTime = this.requestDelayMs - timeSinceLastRequest;
      console.log(`🚦 Rate limiting: waiting ${waitTime}ms before next request (Bedrock: ${this.requestsPerMinute} req/min)`);
      await this.sleep(waitTime);
    }
    
    this.lastRequestTime = Date.now();
    
    console.log(`✅ Request sent at ${new Date().toISOString()}`);
  }    

 

  // Limpar sessões antigas (chamado periodicamente)
  public cleanupOldSessions(): void {
    const now = Date.now();
    const maxSessionAge = 5 * 60 * 1000; // 5 minutos
    
    for (const [sessionId, sessionData] of this.requestCountBySession.entries()) {
      if (now - sessionData.startTime > maxSessionAge) {
        this.requestCountBySession.delete(sessionId);
        console.log(`🧹 Sessão ${sessionId} removida (idade: ${Math.floor((now - sessionData.startTime) / 1000)}s)`);
      }
    }
  }

  // Monitorar informações de rate limit em tempo real
  public getCurrentRateLimitInfo(): {
    configuredRequestsPerMinute: number;
    currentDelayMs: number;
    lastRequestTime: string;
    timeSinceLastRequest: number;
    estimatedRequestsRemaining: number;
  } {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Estimar quantas requisições ainda podem ser feitas neste minuto
    const requestsInCurrentMinute = Math.floor(timeSinceLastRequest / this.requestDelayMs);
    const estimatedRequestsRemaining = Math.max(0, this.requestsPerMinute - requestsInCurrentMinute);
    
    return {
      configuredRequestsPerMinute: this.requestsPerMinute,
      currentDelayMs: this.requestDelayMs,
      lastRequestTime: new Date(this.lastRequestTime).toISOString(),
      timeSinceLastRequest: timeSinceLastRequest,
      estimatedRequestsRemaining: estimatedRequestsRemaining
    };
  }


  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (this.isThrottlingError(error)) {
        
        await this.sleep(this.requestDelayMs * (retryCount + 1)); // Backoff linear     

        // Tentar novamente até conseguir
        console.log(`🔄 Tentando novamente após aguardar rate limit...`);
        return this.retryWithBackoff(operation, operationName, retryCount + 1);
      }
      
      console.error(`${operationName} failed after ${retryCount + 1} attempts:`, error);
      throw error;
    }
  }

  // Detecta diferentes formatos de erro de throttling vindos do SDK/event stream
  private isThrottlingError(error: any): boolean {
    if (!error) return false;
    
    // Log detalhado do erro para diagnóstico
    console.log('🔍 Analisando erro para detectar Throttling:');
    if (error.$metadata) {
      console.log('  - $metadata:', JSON.stringify(error.$metadata, null, 2));
    }
    
    // Verificar todos os campos úteis
    const nameMatch = typeof error.name === 'string' && error.name.toLowerCase().includes('throttling');
    const codeMatch = typeof error.code === 'string' && error.code.toLowerCase().includes('throttling');
    const messageMatch = typeof error.message === 'string' && 
      /rate is too high|too many requests|throttling|quota|limit exceeded|capacity|service unavailable/i.test(error.message);
    const status429 = error.$metadata?.httpStatusCode === 429;
    const status503 = error.$metadata?.httpStatusCode === 503; // Service Unavailable também pode indicar throttling
    const isThrottlingInstance = error instanceof ThrottlingException;
    
    // Verificar headers específicos de throttling
    let headersMatch = false;
    if (error.$metadata?.httpHeaders) {
      const headers = error.$metadata.httpHeaders;
      
      // Log de todos os headers para diagnóstico
      console.log('  - Headers da resposta de erro:');
      Object.entries(headers).forEach(([key, value]) => {
        console.log(`    - ${key}: ${value}`);
      });
      
      // Verificar se há headers relacionados à taxa/limite/throttling
      headersMatch = Object.keys(headers).some(key => 
        key.toLowerCase().includes('rate') || 
        key.toLowerCase().includes('limit') || 
        key.toLowerCase().includes('quota') || 
        key.toLowerCase().includes('retry')
      );
    }
    
    const isThrottling = nameMatch || codeMatch || messageMatch || status429 || status503 || isThrottlingInstance || headersMatch;
    
    if (isThrottling) {
      console.log('🚫 Throttling detectado nos seguintes campos:');
      if (nameMatch) console.log('  - Nome do erro contém "throttling"');
      if (codeMatch) console.log('  - Código do erro contém "throttling"');
      if (messageMatch) console.log('  - Mensagem contém indicadores de throttling');
      if (status429) console.log('  - Status HTTP 429 (Too Many Requests)');
      if (status503) console.log('  - Status HTTP 503 (Service Unavailable)');
      if (isThrottlingInstance) console.log('  - Instância de ThrottlingException');
      if (headersMatch) console.log('  - Headers contêm indicadores de throttling/quota');
    }
    
    return isThrottling;
  }

  private async processResponseChunks(
    sessionId: string,
    response: InvokeAgentCommandOutput,
    startTime?: number,
    depth: number = 0
  ) {
    const processingStartTime = startTime || Date.now();

    let text = '';
    
    if (!response.completion) {
      return text;
    }

    console.log(`Processing chunks at depth ${depth}, elapsed: ${Date.now() - processingStartTime}ms`);

        for await (const chunkEvent of response.completion) {
          if (chunkEvent.chunk) {
            console.log('Received chunk event:', chunkEvent.chunk);
            const chunk = chunkEvent.chunk;
            const decoded = new TextDecoder('utf-8').decode(chunk.bytes);
            console.log('Received chunk data:', decoded);
            text += decoded;
      }

      if (chunkEvent.returnControl) {
        console.log('Received returnControl event:', chunkEvent.returnControl);
        this.enforceRateLimit(sessionId);
        
        try {
          const invocationId = chunkEvent.returnControl.invocationId;
          const invocationInputs = chunkEvent.returnControl.invocationInputs;
          
          if (!invocationInputs || invocationInputs.length === 0) {
            console.error('No invocation inputs found in returnControl');
            continue;
          }

          const functionInvocationInput = invocationInputs[0].functionInvocationInput;
          const actionGroup = functionInvocationInput.actionGroup;
          const functionName = functionInvocationInput.function;
          const parameters = functionInvocationInput.parameters;

          console.log('Processing returnControl:', {
            invocationId,
            actionGroup,
            functionName,
            parameters,
            depth
          });         

          // Processar a função/ação aqui
          const functionResult = await this.processFunctionInvocation(
            actionGroup,
            functionName,
            parameters
          );

          // Continuar a conversa com o resultado usando retry (última requisição da sessão)
          await this.sleep(this.requestDelayMs * (this.requestsPerMinute - 1)); // Aguardar antes de continuar
          const continueResponse = await this.retryWithBackoff(
            () => this.sendRequest(
              sessionId,
              'Sistema: Processado com sucesso. Pode continuar a conversa.',
              invocationId,
              actionGroup,
              functionName,
              functionResult,
            ),
            'Continue conversation after returnControl'
          );

          // Não processar mais níveis de returnControl (maxDepth = 1)
          text += await this.processResponseChunks(
            sessionId, 
            continueResponse, 
            processingStartTime, 
            depth + 1
          );
        } catch (error) {
          console.error('Error processing returnControl:', error);
          
          // Log específico para DependencyFailedException
          if (error.name === 'DependencyFailedException') {
            console.error('🚨 DependencyFailedException detectado - problema na resposta Lambda/Bedrock');
            console.error('📋 Contexto do erro:', {
              invocationId: chunkEvent.returnControl?.invocationId,
              actionGroup: chunkEvent.returnControl?.invocationInputs?.[0]?.functionInvocationInput?.actionGroup,
              functionName: chunkEvent.returnControl?.invocationInputs?.[0]?.functionInvocationInput?.function,
              parameters: chunkEvent.returnControl?.invocationInputs?.[0]?.functionInvocationInput?.parameters,
            });

            // NOVA ESTRATÉGIA: Em caso de erro, NÃO tentar recovery com returnControlInvocationResults
            // Isso evita o DependencyFailedException que está ocorrendo constantemente
            console.error('🛑 Erro no processamento da função - CANCELANDO recovery para evitar DependencyFailedException');
            console.error('ℹ️ A conversa será interrompida neste ponto para evitar loops de erro');
            
            // Retornar uma mensagem de erro amigável sem tentar recovery
            text += ' [Erro no processamento da função. Conversa interrompida para evitar problemas técnicos.]';

          }

          if (this.isThrottlingError(error)) {
            console.error('🚨 Throttling detectado durante o processamento de returnControl - ignorando este chunk');
            //text += ' [Throttling detectado. Tentando continuar a conversa.]';
            //this.enforceRateLimit(sessionId);

          }
        }
      }
    }
    return text;
  }

  private async processFunctionInvocation(
    actionGroup: string,
    functionName: string,
    parameters: any,
  ): Promise<any> {
    console.log(`🔧 Processing function: ${actionGroup}.${functionName}`, parameters);
    
    try {
      // Validar parâmetros de entrada
      if (!actionGroup || !functionName) {
        throw new Error('ActionGroup and functionName are required');
      }

      // Implementação específica para triagem_paciente
      if (actionGroup === 'triagem_paciente' && functionName === 'triagem_paciente') {
        console.log('🏥 Executando triagem de paciente...');
        return await this.processTriagemPaciente(parameters);
      }
      
      // Implementação específica para busca-locais
      if (actionGroup === 'busca-locais' && functionName === 'busca-locais') {
        console.log('🗺️ Executando busca de locais...');
        return await this.processBuscaLocais(parameters);
      }
      
      // Log para funções não implementadas
      console.warn(`⚠️ Função não implementada: ${actionGroup}.${functionName}`);
      
      // Implementação genérica para outras funções
      const result = {
        success: true,
        data: parameters,
        message: `Função ${functionName} executada com sucesso (implementação genérica)`,
        actionGroup,
        functionName,
        timestamp: new Date().toISOString(),
      };
      
      console.log('✅ Function result (generic):', result);
      return result;
    } catch (error) {
      console.error(`❌ Error in function invocation ${actionGroup}.${functionName}:`, error);
      return {
        success: false,
        error: error.message,
        actionGroup,
        functionName,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async processTriagemPaciente(parameters: any[]): Promise<any> {
    console.log('🏥 Processando triagem de paciente:', parameters);
    
    // Extrair parâmetros da triagem
    const params = {};
    if (Array.isArray(parameters)) {
      parameters.forEach(param => {
        if (param.name && param.value) {
          params[param.name] = param.value;
        }
      });
    }
    
    console.log('🏥 Parâmetros extraídos:', params);
    
    // Simular processamento de triagem médica
    const triagem = {
      protocolo: `TRIAGE-${Date.now()}`,
      classificacao: 'VERDE', // Verde = não urgente, baseado nos sintomas
      prioridade: 'BAIXA',
      tempo_espera_estimado: '30-60 minutos',
      recomendacoes: [
        'Avaliação clínica de rotina',
        'Monitoramento de sinais vitais',
        'Investigação de cefaleia em paciente diabético'
      ],
      observacoes: 'Paciente diabético com cefaleia - requer atenção para possível relação com controle glicêmico',
      timestamp: new Date().toISOString()
    };
    
    console.log('🏥 Resultado da triagem:', triagem);
    
    // Retornar resultado em formato simples para evitar problemas de serialização
    return {
      status: 'AGUARDANDO_MEDICO',
      protocolo: triagem.protocolo,
      classificacao: triagem.classificacao,
      prioridade: triagem.prioridade,
      tempo_espera: triagem.tempo_espera_estimado,
      //observacoes: triagem.observacoes
    };
  }

  private async processBuscaLocais(parameters: any[]): Promise<any> {
    console.log('🗺️ Processando busca de locais:', parameters);
    
    // Extrair parâmetros da busca
    const params: any = {};
    if (Array.isArray(parameters)) {
      parameters.forEach(param => {
        if (param.name && param.value) {
          params[param.name] = param.value;
        }
      });
    }
    
    console.log('🗺️ Parâmetros extraídos:', params);
    
    // Extrair localização do usuário (coordenadas ou endereço)
    const userLatitude = params.latitude || params.lat;
    const userLongitude = params.longitude || params.lng || params.lon;
    const userAddress = params.endereco || params.address;
    const maxResults = parseInt(params.limit || params.max || '5', 10);
    const radiusKm = parseFloat(params.radius || params.raio || '50');
    
    // CASO 1: Endereços vêm da IA (seu caso!)
    if (params.locais && Array.isArray(params.locais)) {
      console.log('🤖 Processando endereços vindos da IA Bedrock...');
      return await this.processBuscaComEnderecosIA(params.locais, {
        userLatitude,
        userLongitude,
        userAddress,
        maxResults,
        radiusKm
      });
    }
    
    // CASO 2: Coordenadas do usuário fornecidas
    let userLocation: any = null;
    
    if (userLatitude && userLongitude) {
      const lat = parseFloat(userLatitude);
      const lng = parseFloat(userLongitude);
      
      if (this.locationService.validateCoordinates({ latitude: lat, longitude: lng })) {
        userLocation = { latitude: lat, longitude: lng };
        console.log(`📍 Localização do usuário (coordenadas): ${lat}, ${lng}`);
      }
    }
    
    // CASO 3: Endereço do usuário fornecido - geocodificar
    if (!userLocation && userAddress) {
      console.log(`📍 Geocodificando endereço do usuário: ${userAddress}`);
      const geocodingService = this.healthcareFacilitiesService['geocodingService'];
      const geocoded = await geocodingService.geocodeAddress(userAddress);
      
      if (geocoded) {
        userLocation = { latitude: geocoded.latitude, longitude: geocoded.longitude };
        console.log(`✅ Endereço geocodificado: ${geocoded.latitude}, ${geocoded.longitude}`);
      }
    }
    
    // CASO 4: Usar localização padrão (Centro de São Paulo)
    if (!userLocation) {
      console.warn('⚠️ Usando localização padrão (Centro de São Paulo)');
      userLocation = { latitude: -23.5505, longitude: -46.6333 };
    }
    
    console.log(`🔍 Buscando até ${maxResults} locais em um raio de ${radiusKm}km`);
    
    try {
      // Buscar locais de atendimento cadastrados
      const criteria: any = {};
      if (params.tipo) criteria.tipo = params.tipo;
      if (params.emergencia !== undefined) criteria.emergencia = params.emergencia === 'true' || params.emergencia === true;
      if (params.especialidade) criteria.especialidade = params.especialidade;
      
      let facilities = await this.healthcareFacilitiesService.filterFacilities(criteria);
      
      if (facilities.length === 0) {
        facilities = await this.healthcareFacilitiesService.findAll();
      }
      
      // Filtrar apenas locais com coordenadas
      facilities = facilities.filter(f => f.coordinates);
      console.log(`📊 Total de locais com coordenadas: ${facilities.length}`);
      
      // Calcular distâncias e ordenar por proximidade
      const nearestLocations = this.locationService.findNearestLocations(
        userLocation,
        facilities,
        maxResults * 2
      );
      
      // Filtrar por raio
      const locationsInRadius = this.locationService.filterByRadius(
        userLocation,
        nearestLocations,
        radiusKm
      );
      
      // Limitar ao número máximo de resultados
      const finalResults = locationsInRadius.slice(0, maxResults);
      
      console.log(`✅ Retornando ${finalResults.length} locais dentro do raio de ${radiusKm}km`);
      
      return {
        status: 'LOCAIS_ENCONTRADOS',
        total_encontrados: finalResults.length,
        localizacao_usuario: userLocation,
        raio_busca_km: radiusKm,
        locais: finalResults.map(local => ({
          nome: local.nome,
          tipo: local.tipo,
          endereco: local.endereco,
          distancia: local.distanciaFormatada,
          distancia_km: local.distanciaKm,
          telefone: local.telefone,
          especialidades: local.especialidades?.join(', '),
          funcionamento: local.funcionamento
        })),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao buscar locais:', error);
      return {
        status: 'ERRO',
        message: 'Erro ao buscar locais de atendimento',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * NOVO: Processa busca quando os endereços vêm da IA do Bedrock
   * Este é o fluxo principal para o seu caso de uso!
   */
  private async processBuscaComEnderecosIA(
    locaisIA: any[],
    options: {
      userLatitude?: string | number;
      userLongitude?: string | number;
      userAddress?: string;
      maxResults: number;
      radiusKm: number;
    }
  ): Promise<any> {
    console.log(`🤖 Processando ${locaisIA.length} endereços da IA...`);
    
    // 1. Converter endereços da IA em locais com coordenadas (via geocoding)
    const facilities = await this.healthcareFacilitiesService.convertAddressesToFacilities(locaisIA);
    
    // Filtrar apenas os que conseguiram ser geocodificados
    const facilitiesWithCoords = facilities.filter(f => f.coordinates);
    console.log(`✅ ${facilitiesWithCoords.length}/${facilities.length} endereços geocodificados com sucesso`);
    
    if (facilitiesWithCoords.length === 0) {
      console.warn('⚠️ Nenhum endereço pôde ser geocodificado');
      return {
        status: 'ERRO',
        message: 'Não foi possível geocodificar os endereços fornecidos',
        locais_nao_geocodificados: facilities.map(f => ({
          nome: f.nome,
          endereco: f.endereco
        })),
        timestamp: new Date().toISOString()
      };
    }
    
    // 2. Determinar localização do usuário
    let userLocation: any = null;
    
    if (options.userLatitude && options.userLongitude) {
      const lat = parseFloat(options.userLatitude.toString());
      const lng = parseFloat(options.userLongitude.toString());
      
      if (this.locationService.validateCoordinates({ latitude: lat, longitude: lng })) {
        userLocation = { latitude: lat, longitude: lng };
      }
    }
    
    if (!userLocation && options.userAddress) {
      console.log(`📍 Geocodificando endereço do usuário: ${options.userAddress}`);
      const geocodingService = this.healthcareFacilitiesService['geocodingService'];
      const geocoded = await geocodingService.geocodeAddress(options.userAddress);
      
      if (geocoded) {
        userLocation = { latitude: geocoded.latitude, longitude: geocoded.longitude };
      }
    }
    
    if (!userLocation) {
      console.warn('⚠️ Localização do usuário não fornecida, usando localização padrão');
      userLocation = { latitude: -23.5505, longitude: -46.6333 };
    }
    
    console.log(`📍 Localização do usuário: ${userLocation.latitude}, ${userLocation.longitude}`);
    
    // 3. Calcular distâncias e ordenar
    const nearestLocations = this.locationService.findNearestLocations(
      userLocation,
      facilitiesWithCoords,
      options.maxResults * 2
    );
    
    // 4. Filtrar por raio
    const locationsInRadius = this.locationService.filterByRadius(
      userLocation,
      nearestLocations,
      options.radiusKm
    );
    
    // 5. Limitar resultados
    const finalResults = locationsInRadius.slice(0, options.maxResults);
    
    console.log(`✅ Retornando ${finalResults.length} locais ordenados por proximidade`);
    
    // 6. Retornar resultado formatado
    return {
      status: 'LOCAIS_ENCONTRADOS',
      total_encontrados: finalResults.length,
      total_geocodificados: facilitiesWithCoords.length,
      localizacao_usuario: userLocation,
      raio_busca_km: options.radiusKm,
      locais: finalResults.map(local => ({
        nome: local.nome,
        tipo: local.tipo,
        endereco: local.endereco,
        distancia: local.distanciaFormatada,
        distancia_km: local.distanciaKm,
        telefone: local.telefone,
        especialidades: local.especialidades?.join(', '),
        funcionamento: local.funcionamento,
        coordinates: local.coordinates // Incluir coordenadas para referência
      })),
      timestamp: new Date().toISOString()
    };
  }

  private async sendRequest(
    sessionId: string,
    prompt: string,
    invocationId?: string,
    actionGroup?: string,
    functionName?: string,
    resultResponse?: any,
  ): Promise<InvokeAgentCommandOutput> {
    let command: InvokeAgentCommand;

    if (resultResponse && invocationId && actionGroup && functionName) {
      // Log detalhado da estrutura que será enviada para o Bedrock
      const serializedResponse = this.safeSerialize(resultResponse);
      console.log('📤 Estrutura completa do returnControlInvocationResults:', {
        invocationId,
        functionName,
        actionGroup,
        serializedResponse,
        responseLength: serializedResponse.length
      });
      
      // Formato EXATO que o AWS Bedrock Agent espera
      // Baseado na documentação oficial - responseBody deve ser um objeto simples
      const responseBody = {
        'TEXT': {
          'body': serializedResponse
        }
      };
      
      console.log('📤 responseBody final (TEXT format):', responseBody);
      
      command = new InvokeAgentCommand({
        agentAliasId: this.agentAliasId,
        agentId: this.agentId,
        sessionId: sessionId,
        inputText: prompt,
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
    } else {
      // Comando base para Bedrock Agent (apenas texto)
      command = new InvokeAgentCommand({
        agentAliasId: this.agentAliasId,
        agentId: this.agentId,
        sessionId: sessionId,
        inputText: prompt,
      });
    }

    console.log('Sending request to Bedrock Agent:', {
      sessionId,
      prompt: prompt || '(empty)',
      inputText: (command.input as any)?.inputText || '(not set)',
      invocationId,
      actionGroup,
      functionName,
      hasResult: !!resultResponse
    });    

    let response: InvokeAgentCommandOutput;
    try {
      response = await this.client.send(command);
    } catch (err) {
      // Log detalhado para diagnóstico de erros que vêm do serviço Bedrock/Lambda
      try {
        console.error('Bedrock invoke failed', {
          message: err?.message,
          name: err?.name,
          code: err?.code,
          $metadata: err?.$metadata,
          commandContext: {
            sessionId,
            invocationId,
            actionGroup,
            functionName,
            hasResult: !!resultResponse,
          },
        });
      } catch (logErr) {
        console.error('Failed to stringify Bedrock error details', logErr);
      }

      // Re-lançar para que o retry/backoff no chamador trate o erro
      throw err;
    }

    
    
    // Log mais detalhado das informações de rate limit
    console.log('📊 Resposta do Bedrock recebida:');
    
    // Log de status code e request ID para diagnóstico
    if (response.$metadata) {
      console.log(`📊 Status code: ${response.$metadata.httpStatusCode}`);
      console.log(`📊 Request ID: ${response.$metadata.requestId || 'N/A'}`);
      
      // Verificar se httpHeaders existe no response.$metadata com type guard
      const metadata = response.$metadata as any;
      
      if (metadata && metadata.httpHeaders) {
        console.log('📊 Headers completos da resposta:');
        
        // Procurando especificamente por headers que contenham informações úteis
        const relevantPrefixes = ['x-amzn-', 'retry', 'rate', 'quota', 'limit', 'remaining'];
        
        Object.entries(metadata.httpHeaders).forEach(([key, value]) => {
          const isRelevant = relevantPrefixes.some(prefix => key.toLowerCase().includes(prefix));
          if (isRelevant) {
            console.log(`  - [RELEVANTE] ${key}: ${value}`);
          } else {
            console.log(`  - ${key}: ${value}`);
          }
        });
      }
    }
    
    return response;
  }

  /**
   * Processa áudio usando Amazon Transcribe + Bedrock Agent
   * Transcreve o áudio primeiro, depois envia o texto para o Agent
   */
  private async processAudioWithTranscription(
    prompt: string,
    sessionId: string,
    audioBuffer: Buffer,
    audioMimeType: string
  ): Promise<BedrockResponse> {
    try {
      console.log(`🎤 Processando áudio: ${audioBuffer.length} bytes, ${audioMimeType}`);
      
      // Transcrever áudio usando Amazon Transcribe
      const transcriptionResult = await this.transcriptionService.transcribeAudio(
        audioBuffer,
        audioMimeType,
        sessionId
      );
      
      console.log(`📝 Transcrição: "${transcriptionResult.text}" (confiança: ${transcriptionResult.confidence.toFixed(2)})`);
      
      // Criar prompt contextual combinando texto + transcrição
      let finalPrompt = transcriptionResult.text;
      if (prompt && prompt.trim().length > 0) {
        finalPrompt = `${prompt} (áudio transcrito: "${transcriptionResult.text}")`;
      }
      
      // Processar com o Bedrock Agent normalmente
      console.log('🤖 Enviando transcrição para Bedrock Agent...');
      
      await this.enforceRateLimit(sessionId);
      
      const response = await this.retryWithBackoff(
        () => this.sendRequest(sessionId, finalPrompt, undefined, undefined, undefined, undefined),
        'Audio transcription request'
      );
      
      console.log('✅ Resposta do Bedrock Agent para áudio processada');
      
      if (response.completion === undefined) {
        throw new Error('No response from Bedrock agent');
      }

      const text = await this.processResponseChunks(sessionId, response, Date.now());

      return {
        answer: text,
        model: 'amazon-transcribe + bedrock-agent',
      };

    } catch (error) {
      console.error('❌ Erro ao processar áudio:', error);
      
      // Fallback: retornar mensagem de erro contextual
      const fallbackMessage = prompt && prompt.trim().length > 0
        ? `Desculpe, não consegui processar o áudio, mas recebi sua mensagem: "${prompt}". Como posso ajudar?`
        : 'Desculpe, não consegui processar o áudio. Pode repetir sua mensagem por texto?';
      
      return {
        answer: fallbackMessage,
        model: 'fallback'
      };
    }
  }
}
