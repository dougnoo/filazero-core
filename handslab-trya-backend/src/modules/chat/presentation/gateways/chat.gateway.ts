import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { GetOnboardDataUseCase } from '../../application/use-cases/get-onboard-data.use-case';
import { SendMessageDto } from '../../application/dtos/send-message.dto';
import { WebSocketResponseDto } from '../dtos/websocket-response.dto';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/presentation/roles.guard';
import { Roles } from '../../../../shared/presentation/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { InvalidMessageError } from '../../domain/errors/invalid-message.error';
import { FileProcessingError } from '../../domain/errors/file-processing.error';
import { ChatProcessingError } from '../../domain/errors/chat-processing.error';
import type { ChatMessagePayloadDto } from '../dtos/chat-message-payload.dto';
import { MessagePhase } from '../../application/dtos/chat-response.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BENEFICIARY, UserRole.DEPENDENT)
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getOnboardDataUseCase: GetOnboardDataUseCase,
  ) {}

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatMessagePayloadDto,
  ): Promise<WebSocketResponseDto> {
    try {
      const user = (client as any).user;

      const onboardData = await this.getOnboardDataUseCase.execute(
        user.dbId || user.id,
      );

      const dto = SendMessageDto.create({
        message: payload.message,
        sessionId: payload.session_id,
        userId: user.dbId || user.id,
        userName: user.name,
        tenantId: user.tenantId,
        audio: payload.audio,
        audioFormat: payload.audio_format,
        files: payload.files,
        onboardData: onboardData ?? undefined,
        hasOnboarded: onboardData !== null,
      });

      const response = await this.sendMessageUseCase.execute(dto);

      return {
        is_complete: response.isComplete,
        message: response.message,
        messages: response.messages,
        session_id: response.sessionId,
        transcribed_text: response.transcribedText,
        current_stage: response.currentStage,
      };
    } catch (error) {
      console.error('[ChatGateway] Error processing message:', error);

      if (error instanceof InvalidMessageError) {
        return {
          is_complete: false,
          message: 'Invalid message format',
          session_id: payload.session_id,
          messages: [
            {
              content: 'Invalid message format',
              timestamp: new Date(),
              phase: MessagePhase.ERROR,
            },
          ],
        };
      }
      if (error instanceof FileProcessingError) {
        return {
          is_complete: false,
          message: 'Failed to process files',
          session_id: payload.session_id,
          messages: [
            {
              content: 'Failed to process files',
              timestamp: new Date(),
              phase: MessagePhase.ERROR,
            },
          ],
        };
      }
      if (error instanceof ChatProcessingError) {
        return {
          is_complete: false,
          message: 'Failed to send message',
          session_id: payload.session_id,
          messages: [
            {
              content: 'Failed to send message',
              timestamp: new Date(),
              phase: MessagePhase.ERROR,
            },
          ],
        };
      }

      return {
        is_complete: false,
        message: 'Failed to process message',
        session_id: payload.session_id,
        messages: [
          {
            content: 'Failed to process message',
            timestamp: new Date(),
            phase: MessagePhase.ERROR,
          },
        ],
      };
    }
  }
}
