import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { GetOnboardDataUseCase } from './application/use-cases/get-onboard-data.use-case';
import { GetTriageHistoryUseCase } from './application/use-cases/get-triage-history.use-case';
import { GetTriageSessionUseCase } from './application/use-cases/get-triage-session.use-case';
import { GetActiveSessionUseCase } from './application/use-cases/get-active-session.use-case';
import { FileProcessorService } from './infrastructure/converters/file-processor.service';
import { ChatGateway } from './presentation/gateways/chat.gateway';
import { TriageHistoryController } from './presentation/controllers/triage-history.controller';
import { AwsLambdaChatProvider } from './infrastructure/providers/aws-lambda-chat.provider';
import { PdfLibConverter } from './infrastructure/converters/pdf-lib.converter';
import { TypeOrmOnboardDataRepository } from './infrastructure/repositories/typeorm-onboard-data.repository';
import { TriageHistoryRepository } from './infrastructure/repositories/triage-history.repository';
import { CHAT_PROVIDER_TOKEN } from './domain/ports/chat-provider.interface';
import { FILE_PROCESSOR_TOKEN } from './domain/ports/file-processor.interface';
import { PDF_CONVERTER_TOKEN } from './domain/ports/pdf-converter.interface';
import { ONBOARD_DATA_REPOSITORY_TOKEN } from './domain/repositories/onboard-data.repository';
import { TRIAGE_HISTORY_REPOSITORY_TOKEN } from './domain/repositories/triage-history.repository.interface';
import { DynamoDBProvider } from '../../shared/infrastructure/providers/dynamodb.provider';
import { RedisProvider } from '../../shared/infrastructure/providers/redis.provider';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [ConfigModule, AuthModule, TypeOrmModule.forFeature([User])],
  controllers: [TriageHistoryController],
  providers: [
    SendMessageUseCase,
    GetOnboardDataUseCase,
    GetTriageHistoryUseCase,
    GetTriageSessionUseCase,
    GetActiveSessionUseCase,
    ChatGateway,
    DynamoDBProvider,
    RedisProvider,
    {
      provide: CHAT_PROVIDER_TOKEN,
      useClass: AwsLambdaChatProvider,
    },
    {
      provide: FILE_PROCESSOR_TOKEN,
      useClass: FileProcessorService,
    },
    {
      provide: PDF_CONVERTER_TOKEN,
      useClass: PdfLibConverter,
    },
    {
      provide: ONBOARD_DATA_REPOSITORY_TOKEN,
      useClass: TypeOrmOnboardDataRepository,
    },
    {
      provide: TRIAGE_HISTORY_REPOSITORY_TOKEN,
      useClass: TriageHistoryRepository,
    },
  ],
  exports: [SendMessageUseCase],
})
export class ChatModule {}
