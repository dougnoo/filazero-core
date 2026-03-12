import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException, Inject } from '@nestjs/common';
import { CleanChatService } from './clean-chat.service';
import { NewMessageDto } from './dto/new-message.dto';
import { TenantService } from '../tenant/tenant.service';
import { ISessionRepository } from './domain/interfaces/session-repository.interface';
import { SESSION_REPOSITORY_TOKEN } from './tokens';

interface MessageData {
  message: string;
  model?: string;
  sessionId?: string;
  tenantId: string;  // OBRIGATÓRIO para multi-tenancy
  audioData?: string;  // Base64 encoded audio
  audioMimeType?: string;
  imageData?: string;  // Base64 encoded image
  imageMimeType?: string;
  medicalConsent?: boolean;  // Consent for medical image processing
  latitude?: number;  // User's latitude for location-based services
  longitude?: number;  // User's longitude for location-based services
}

interface TenantSession {
  socketId: string;
  sessionId: string;
  tenantId: string;
  tenantName?: string;
  connectedAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Configure conforme necessário para produção
  },
  namespace: '/chat',
  // Configurações para evitar desconexões
  transports: ['websocket', 'polling'],
  pingTimeout: 60000, // 60 segundos para receber pong
  pingInterval: 25000, // Enviar ping a cada 25 segundos
  upgradeTimeout: 30000, // 30 segundos para upgrade
  allowEIO3: true,
  // Configurações específicas do Socket.IO
  connectTimeout: 45000, // 45 segundos para conectar
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private heartbeatIntervals = new Map<string, NodeJS.Timeout>(); // socketId -> interval
  private clientLastSeen = new Map<string, number>(); // socketId -> timestamp
  private inactiveCheckInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly cleanChatService: CleanChatService,
    private readonly tenantService: TenantService,
    @Inject(SESSION_REPOSITORY_TOKEN) private readonly sessionRepository: ISessionRepository,
  ) {
    // Intervalo será iniciado no afterInit quando o servidor estiver pronto
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    
    // Aguardar 1 minuto antes de iniciar verificações para garantir que o servidor está completamente pronto
    setTimeout(() => {
      this.logger.log('Starting inactive connections monitoring');
      this.inactiveCheckInterval = setInterval(() => {
        this.checkInactiveConnections();
      }, 30000); // Verificar a cada 30 segundos
    }, 60000); // Esperar 1 minuto antes de começar
  }

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
    
    // Marcar última atividade
    this.clientLastSeen.set(client.id, Date.now());
    
    // Extrair tenantId dos query params ou headers
    const tenantId = client.handshake.query.tenantId as string ||
                    client.handshake.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      this.logger.error(`Conexão rejeitada - tenantId não fornecido: ${client.id}`);
      client.emit('connection-error', { 
        message: 'tenantId é obrigatório para conectar' 
      });
      client.disconnect(true);
      return;
    }

    // Configurar heartbeat para este cliente
    this.setupClientHeartbeat(client);
    
    // Validar tenant de forma assíncrona
    this.validateTenantAndCreateSession(client, tenantId);
  }

  private async validateTenantAndCreateSession(client: Socket, tenantId: string) {
    try {
      // Validar se o tenant existe e está ativo
      const tenantConfig = await this.tenantService.getTenantConfig(tenantId);
      
      // Verificar se cliente enviou session_id via query params (para retomar sessão existente)
      const clientSessionId = client.handshake.query.sessionId as string ||
                              client.handshake.query.session_id as string;
      
      // Usa o session_id do cliente se fornecido, senão gera um novo
      const sessionId = clientSessionId && clientSessionId.length > 10 
        ? `${tenantId}-${clientSessionId}` 
        : `${tenantId}-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create session using Clean Architecture SessionRepository
      const tenantSession = this.sessionRepository.createSession(
        client.id,
        sessionId,
        tenantId,
        tenantConfig.name
      );
      
      // Adicionar cliente ao room do tenant
      client.join(`tenant-${tenantId}`);

      // Enviar confirmação de conexão com dados do tenant
      client.emit('session-created', { 
        sessionId,
        tenantId,
        tenantName: tenantConfig.name,
        connectedAt: tenantSession.connectedAt.toISOString()
      });
      
      this.logger.log(`✅ Sessão criada: ${sessionId} para tenant: ${tenantConfig.name} (${tenantId})`);
      
    } catch (error) {
      this.logger.error(`❌ Erro na validação do tenant ${tenantId}:`, error.message);
      client.emit('connection-error', { 
        message: `Tenant inválido ou inativo: ${tenantId}` 
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const session = this.sessionRepository.getSession(client.id);
    if (session) {
      this.logger.log(`🔌 Cliente desconectado: ${client.id}, tenant: ${session.tenantName} (${session.tenantId}), sessão: ${session.sessionId}`);
      
      // Remover do room do tenant
      client.leave(`tenant-${session.tenantId}`);
      
      // Remove session using SessionRepository
      this.sessionRepository.removeSession(client.id);
    } else {
      this.logger.log(`Cliente desconectado: ${client.id} (sem sessão ativa)`);
    }

    // Limpar heartbeat e última atividade
    this.cleanupClientResources(client.id);
  }

  @SubscribeMessage('chat-message')
  async handleMessage(
    @MessageBody() data: MessageData,
    @ConnectedSocket() client: Socket,
  ) {
    // Marcar atividade do cliente
    this.clientLastSeen.set(client.id, Date.now());
    
    const session = this.sessionRepository.getSession(client.id);
    
    if (!session) {
      client.emit('error', { message: 'Sessão não encontrada' });
      return;
    }

    try {
      this.logger.log(`Mensagem recebida de ${client.id}: ${data.message}`);
      
      // Confirmar recebimento da mensagem
      client.emit('message-received', { 
        timestamp: new Date().toISOString(),
        message: data.message 
      });

      // Validar se o tenantId da mensagem confere com a sessão
      if (!data.tenantId) {
        client.emit('chat-error', {
          message: 'tenantId é obrigatório na mensagem',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (data.tenantId !== session.tenantId) {
        client.emit('chat-error', {
          message: `tenantId da mensagem (${data.tenantId}) não confere com a sessão (${session.tenantId})`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Criar DTO para o serviço
      const messageDto: NewMessageDto = {
        message: data.message || '',
        model: (data.model as any) || 'amazon.titan-text-lite-v1',
        sessionId: session.sessionId,
        tenantId: session.tenantId,
        audioData: data.audioData,
        audioMimeType: data.audioMimeType,
        imageData: data.imageData,
        imageMimeType: data.imageMimeType,
        medicalConsent: data.medicalConsent || false,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      this.logger.log(`Dados recebidos:`, {
        hasMessage: !!(data.message && data.message.trim().length > 0),
        hasAudio: !!data.audioData,
        hasImage: !!data.imageData,
        audioMimeType: data.audioMimeType,
        imageMimeType: data.imageMimeType,
        medicalConsent: data.medicalConsent,
        messageLength: data.message?.length || 0,
        audioDataLength: data.audioData?.length || 0,
        imageDataLength: data.imageData?.length || 0,
        hasLocation: !!(data.latitude && data.longitude),
        latitude: data.latitude,
        longitude: data.longitude,
      });

      // Processar áudio se fornecido
      let audioBuffer: Buffer | undefined;
      if (data.audioData) {
        try {
          // Decodificar base64 para buffer
          audioBuffer = Buffer.from(data.audioData, 'base64');
          this.logger.log(`🎤 Áudio recebido: ${audioBuffer.length} bytes, tipo: ${data.audioMimeType}`);
        } catch (error) {
          this.logger.error('Erro ao decodificar áudio:', error);
          client.emit('chat-error', {
            message: 'Erro ao processar áudio. Formato inválido.',
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      // Processar imagem se fornecida
      let imageBuffer: Buffer | undefined;
      if (data.imageData) {
        // Verificar consentimento médico
        if (!data.medicalConsent) {
          client.emit('chat-error', {
            message: 'Consentimento médico é obrigatório para envio de imagens.',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        try {
          // Remover prefixo data URL se existir
          const base64Data = data.imageData.replace(/^data:image\/[a-z]+;base64,/, '');
          imageBuffer = Buffer.from(base64Data, 'base64');
          this.logger.log(`🏥 Imagem médica recebida: ${imageBuffer.length} bytes, tipo: ${data.imageMimeType}`);
        } catch (error) {
          this.logger.error('Erro ao decodificar imagem:', error);
          client.emit('chat-error', {
            message: 'Erro ao processar imagem. Formato inválido.',
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      // Indicar que o bot está "digitando"
      let processingMessage = 'Digitando...';
      if (imageBuffer) processingMessage = 'Analisando imagem médica...';
      else if (audioBuffer) processingMessage = 'Processando áudio...';
      
      client.emit('bot-typing', { isTyping: true, message: processingMessage });

      // Processar mensagem com AWS Bedrock (com áudio e/ou imagem se disponível)
      const response = await this.cleanChatService.chat(
        messageDto, 
        audioBuffer, 
        data.audioMimeType,
        imageBuffer,
        data.imageMimeType
      );

      // Parar indicador de "digitando"
      client.emit('bot-typing', { isTyping: false });

      // Enviar resposta do bot
      const chatResponse: any = {
        answer: response.answer,
        model: response.model,
        timestamp: new Date().toISOString(),
        sessionId: session.sessionId,
      };

      // Incluir análise de imagem se houver
      if (response.imageAnalysis) {
        chatResponse.imageAnalysis = {
          urgencyLevel: response.imageAnalysis.urgencyLevel,
          medicalAssessment: response.imageAnalysis.medicalAssessment,
          disclaimer: response.imageAnalysis.disclaimer,
          detectedLabels: response.imageAnalysis.labels.length,
          medicalKeywords: response.imageAnalysis.medicalKeywords.length
        };
      }

      client.emit('chat-response', chatResponse);

      this.logger.log(`RespostaQA enviada para ${client.id}`);

    } catch (error) {
      this.logger.error(`Erro ao processar mensagem de ${client.id}:`, error);
      
      // Parar indicador de "digitando" em caso de erro
      client.emit('bot-typing', { isTyping: false });
      
      // Enviar erro para o cliente
      client.emit('chat-error', {
        message: 'Erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  }

  @SubscribeMessage('get-session-info')
  handleGetSessionInfo(@ConnectedSocket() client: Socket) {
    const session = this.sessionRepository.getSession(client.id);
    
    if (session) {
      client.emit('session-info', {
        sessionId: session.sessionId,
        socketId: session.socketId,
        connected: true,
      });
    } else {
      client.emit('session-info', { connected: false });
    }
  }

  // Método para broadcast (opcional - para mensagens administrativas)
  broadcastMessage(message: string) {
    this.server.emit('broadcast', {
      message,
      timestamp: new Date().toISOString(),
      type: 'system',
    });
  }

  // Métodos utilitários para Multi-Tenancy
  
  getActiveSessionsCount(): number {
    return this.sessionRepository.getActiveSessionCount();
  }

  getActiveSessionsByTenant(tenantId: string): any[] {
    return this.sessionRepository.getSessionsByTenant(tenantId).map(session => ({
      socketId: session.socketId,
      sessionId: session.sessionId,
      tenantId: session.tenantId,
      tenantName: session.tenantName,
      connectedAt: session.connectedAt,
    }));
  }

  getTenantStats(): Map<string, { count: number; tenantName?: string }> {
    const stats = new Map<string, { count: number; tenantName?: string }>();
    
    for (const session of this.sessionRepository.getAllActiveSessions()) {
      const current = stats.get(session.tenantId) || { count: 0, tenantName: session.tenantName };
      current.count++;
      if (session.tenantName) current.tenantName = session.tenantName;
      stats.set(session.tenantId, current);
    }
    
    return stats;
  }

  // Broadcast para todos os clientes de um tenant específico
  broadcastToTenant(tenantId: string, event: string, data: any): void {
    this.server.to(`tenant-${tenantId}`).emit(event, {
      ...data,
      tenantId,
      timestamp: new Date().toISOString()
    });
  }

  // Desconectar sessão específica
  disconnectSession(sessionId: string): boolean {
    for (const session of this.sessionRepository.getAllActiveSessions()) {
      if (session.sessionId === sessionId) {
        const client = this.server.sockets.sockets.get(session.socketId);
        if (client) {
          client.disconnect();
          return true;
        }
      }
    }
    return false;
  }

  // Desconectar todos os clientes de um tenant
  disconnectTenant(tenantId: string): number {
    const tenantSessions = this.sessionRepository.getSessionsByTenant(tenantId);
    if (tenantSessions.length === 0) return 0;

    let disconnectedCount = 0;
    for (const session of tenantSessions) {
      const client = this.server.sockets.sockets.get(session.socketId);
      if (client) {
        client.emit('tenant-disconnection', { 
          reason: 'Tenant desconectado pelo administrador',
          tenantId 
        });
        client.disconnect();
        disconnectedCount++;
      }
    }

    return disconnectedCount;
  }

  // Handler para comandos administrativos
  @SubscribeMessage('admin-command')
  async handleAdminCommand(
    @MessageBody() data: { command: string; tenantId?: string; params?: any },
    @ConnectedSocket() client: Socket,
  ) {
    const session = this.sessionRepository.getSession(client.id);
    
    if (!session) {
      client.emit('error', { message: 'Sessão não encontrada' });
      return;
    }

    // Verificar se o tenant tem permissões administrativas (implementar conforme necessário)
    try {
      const tenantConfig = await this.tenantService.getTenantConfig(session.tenantId);
      
      if (tenantConfig.plan !== 'enterprise') {
        client.emit('admin-error', { 
          message: 'Comandos administrativos disponíveis apenas para planos enterprise' 
        });
        return;
      }

      switch (data.command) {
        case 'get-stats':
          const stats = this.getTenantStats();
          client.emit('admin-stats', { 
            tenantStats: Object.fromEntries(stats),
            totalSessions: this.getActiveSessionsCount()
          });
          break;

        case 'broadcast':
          if (data.tenantId && data.params?.message) {
            this.broadcastToTenant(data.tenantId, 'admin-broadcast', {
              message: data.params.message,
              from: session.tenantName
            });
            client.emit('admin-success', { message: 'Broadcast enviado' });
          }
          break;

        default:
          client.emit('admin-error', { message: 'Comando não reconhecido' });
      }
      
    } catch (error) {
      client.emit('admin-error', { message: error.message });
    }
  }

  // === MÉTODOS DE HEARTBEAT E GERENCIAMENTO DE CONEXÃO ===

  private setupClientHeartbeat(client: Socket): void {
    // Configurar ping personalizado a cada 20 segundos
    const heartbeatInterval = setInterval(() => {
      const lastSeen = this.clientLastSeen.get(client.id) || 0;
      const timeSinceLastSeen = Date.now() - lastSeen;
      
      // Se cliente não respondeu por mais de 90 segundos, desconectar
      if (timeSinceLastSeen > 90000) {
        this.logger.warn(`Cliente ${client.id} inativo por ${timeSinceLastSeen}ms - desconectando`);
        client.disconnect(true);
        return;
      }
      
      // Enviar ping customizado
      client.emit('ping', { 
        timestamp: Date.now(),
        message: 'keep-alive' 
      });
      
      this.logger.debug(`Ping enviado para ${client.id} (última atividade: ${timeSinceLastSeen}ms atrás)`);
    }, 20000);

    this.heartbeatIntervals.set(client.id, heartbeatInterval);

    // Configurar listener para pong do cliente
    client.on('pong', (data) => {
      this.clientLastSeen.set(client.id, Date.now());
      this.logger.debug(`Pong recebido de ${client.id}:`, data);
    });

    // Configurar listener para qualquer atividade do cliente
    client.onAny(() => {
      this.clientLastSeen.set(client.id, Date.now());
    });
  }

  private cleanupClientResources(clientId: string): void {
    // Limpar interval de heartbeat
    const interval = this.heartbeatIntervals.get(clientId);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(clientId);
    }

    // Limpar última atividade
    this.clientLastSeen.delete(clientId);
    
    this.logger.debug(`Recursos limpos para cliente ${clientId}`);
  }

  private checkInactiveConnections() {
    // Verificar se o servidor está pronto
    if (!this.server || !this.server.sockets || !this.server.sockets.sockets) {
      this.logger.warn('WebSocket server not ready yet, skipping inactive check');
      return;
    }

    const now = Date.now();
    const inactiveThreshold = 2 * 60 * 1000; // 2 minutos

    for (const [clientId, lastSeen] of this.clientLastSeen.entries()) {
      const timeSinceLastSeen = now - lastSeen;
      
      if (timeSinceLastSeen > inactiveThreshold) {
        this.logger.warn(`Detectada conexão inativa: ${clientId} (${timeSinceLastSeen}ms)`);
        
        const client = this.server.sockets.sockets.get(clientId);
        if (client) {
          client.emit('connection-timeout', {
            message: 'Conexão inativa detectada',
            lastSeen: new Date(lastSeen).toISOString(),
            timeoutIn: 30000 // 30 segundos para reativar
          });
          
          // Dar 30 segundos para o cliente responder antes de desconectar
          setTimeout(() => {
            const currentLastSeen = this.clientLastSeen.get(clientId) || 0;
            if (currentLastSeen === lastSeen) {
              this.logger.warn(`Desconectando cliente inativo: ${clientId}`);
              client.disconnect(true);
            }
          }, 30000);
        }
      }
    }
  }

  // Handler para pong do cliente
  @SubscribeMessage('pong')
  handlePong(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    this.clientLastSeen.set(client.id, Date.now());
    this.logger.debug(`Pong manual recebido de ${client.id}:`, data);
    
    // Confirmar que recebemos o pong
    client.emit('pong-ack', { 
      timestamp: Date.now(),
      receivedData: data 
    });
  }

  // Handler para keepalive manual do cliente
  @SubscribeMessage('keep-alive')
  handleKeepAlive(@ConnectedSocket() client: Socket) {
    this.clientLastSeen.set(client.id, Date.now());
    
    const session = this.sessionRepository.getSession(client.id);
    client.emit('keep-alive-ack', {
      timestamp: Date.now(),
      sessionId: session?.sessionId,
      tenantId: session?.tenantId,
      connected: true
    });
  }

  // Método para estatísticas de conexão
  getConnectionStats(): any {
    const now = Date.now();
    const stats = {
      totalConnections: this.clientLastSeen.size,
      heartbeatIntervals: this.heartbeatIntervals.size,
      connections: [] as any[]
    };

    for (const [clientId, lastSeen] of this.clientLastSeen.entries()) {
      const session = this.sessionRepository.getSession(clientId);
      stats.connections.push({
        clientId,
        sessionId: session?.sessionId,
        tenantId: session?.tenantId,
        lastSeen: new Date(lastSeen).toISOString(),
        timeSinceLastSeen: now - lastSeen,
        hasHeartbeat: this.heartbeatIntervals.has(clientId)
      });
    }

    return stats;
  }
}