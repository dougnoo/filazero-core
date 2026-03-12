import { FaqQuestion } from '../entities/faq-question.entity';

export interface IFaqService {
  answerQuestion(question: FaqQuestion): Promise<string>;
}

export const FAQ_SERVICE_TOKEN = 'FAQ_SERVICE_TOKEN';
