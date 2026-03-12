import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FaqController } from './presentation/faq.controller';
import { AskFaqUseCase } from './application/use-cases/ask-faq.use-case';
import { ListFaqTopicsUseCase } from './application/use-cases/list-faq-topics.use-case';
import { BedrockFaqService } from './infrastructure/services/bedrock-faq.service';
import { FAQ_SERVICE_TOKEN } from './domain/interfaces/faq.service.interface';

@Module({
  imports: [ConfigModule],
  controllers: [FaqController],
  providers: [
    AskFaqUseCase,
    ListFaqTopicsUseCase,
    {
      provide: FAQ_SERVICE_TOKEN,
      useClass: BedrockFaqService,
    },
  ],
  exports: [AskFaqUseCase],
})
export class FaqModule {}
