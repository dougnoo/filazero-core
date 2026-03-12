import { Injectable, Inject } from '@nestjs/common';
import type { IFaqService } from '../../domain/interfaces/faq.service.interface';
import { FAQ_SERVICE_TOKEN } from '../../domain/interfaces/faq.service.interface';
import { FaqQuestion } from '../../domain/entities/faq-question.entity';
import { AskFaqDto } from '../dto/ask-faq.dto';
import { FaqResponseDto } from '../dto/faq-response.dto';

@Injectable()
export class AskFaqUseCase {
  constructor(
    @Inject(FAQ_SERVICE_TOKEN)
    private readonly faqService: IFaqService,
  ) {}

  async execute(dto: AskFaqDto): Promise<FaqResponseDto> {
    console.log('[AskFaqUseCase] Processing question:', {
      category: dto.category,
      messageLength: dto.message.length,
      timestamp: new Date().toISOString(),
    });

    try {
      const question = FaqQuestion.create(dto.message, dto.category);
      const answer = await this.faqService.answerQuestion(question);

      console.log('[AskFaqUseCase] Question answered successfully');

      return {
        question: dto.message,
        category: dto.category,
        answer,
      };
    } catch (err) {
      const error = err as Error;
      console.error('[AskFaqUseCase] ❌ Error processing question:', {
        error: error.message,
        category: dto.category,
      });
      throw error;
    }
  }
}
