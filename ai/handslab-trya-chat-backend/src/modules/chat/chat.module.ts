import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CleanChatService } from './clean-chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { MedicalImageModule } from '../medical-image';
import { AwsbedrockModule } from '@modules/awsbedrock/awsbedrock.module';
import { TenantModule } from '../tenant/tenant.module';

// Clean Architecture imports
import {
  TenantRepositoryAdapter,
  BedrockRepositoryAdapter,
  MedicalImageRepositoryAdapter,
  SessionRepository,
} from './infrastructure';
import {
  ChatApplicationService,
  ProcessTextMessageUseCase,
  ProcessAudioMessageUseCase,
  ProcessImageMessageUseCase,
  ProcessComplexMessageUseCase,
} from './application';

// Import tokens from separate file to avoid circular imports
import {
  TENANT_REPOSITORY_TOKEN,
  BEDROCK_REPOSITORY_TOKEN,
  MEDICAL_IMAGE_REPOSITORY_TOKEN,
  SESSION_REPOSITORY_TOKEN,
  CHAT_SERVICE_TOKEN,
} from './tokens';

@Module({
  imports: [AwsbedrockModule, TenantModule, MedicalImageModule],
  controllers: [ChatController],
  providers: [
    // Legacy service (kept for backward compatibility)
    ChatService,
    ChatGateway,
    
    // Clean Architecture providers
    // Infrastructure layer - register both class and token
    TenantRepositoryAdapter,
    {
      provide: TENANT_REPOSITORY_TOKEN,
      useExisting: TenantRepositoryAdapter,
    },
    BedrockRepositoryAdapter,
    {
      provide: BEDROCK_REPOSITORY_TOKEN,
      useExisting: BedrockRepositoryAdapter,
    },
    MedicalImageRepositoryAdapter,
    {
      provide: MEDICAL_IMAGE_REPOSITORY_TOKEN,
      useExisting: MedicalImageRepositoryAdapter,
    },
    SessionRepository,
    {
      provide: SESSION_REPOSITORY_TOKEN,
      useExisting: SessionRepository,
    },
    
    // Application layer
    ProcessTextMessageUseCase,
    ProcessAudioMessageUseCase,
    ProcessImageMessageUseCase,
    ProcessComplexMessageUseCase,
    ChatApplicationService,
    {
      provide: CHAT_SERVICE_TOKEN,
      useExisting: ChatApplicationService,
    },
    
    // Clean facade service
    CleanChatService,
  ],
  exports: [
    // Export both legacy and new services for backward compatibility
    ChatService,
    ChatGateway,
    CleanChatService,
    
    // Export Clean Architecture components for testing/advanced usage
    ChatApplicationService,
    SessionRepository,
    CHAT_SERVICE_TOKEN,
    SESSION_REPOSITORY_TOKEN,
    ProcessTextMessageUseCase,
    ProcessAudioMessageUseCase,
    ProcessImageMessageUseCase,
    ProcessComplexMessageUseCase,
  ],
})
export class ChatModule {}
