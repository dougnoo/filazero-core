import { Injectable } from '@nestjs/common';
import { FaqCategory } from '../../domain/entities/faq-question.entity';
import { FaqTopicsResponseDto, FaqTopicDto } from '../dto/faq-topic.dto';

@Injectable()
export class ListFaqTopicsUseCase {
  execute(category: FaqCategory): FaqTopicsResponseDto {
    const topics = this.getTopicsByCategory(category);
    return { category, topics };
  }

  private getTopicsByCategory(category: FaqCategory): FaqTopicDto[] {
    const topicsMap = {
      [FaqCategory.GENERAL]: [
        { title: 'O que é a Plataforma Trya?' },
        { title: 'Como a plataforma funciona na prática?' },
        { title: 'Como faço para acessar?' },
        { title: 'Minhas informações ficam seguras?' },
      ],
      [FaqCategory.TRIAGE_AI]: [
        { title: 'Como funciona a triagem médica inteligente?' },
        { title: 'O que é analisado durante a triagem?' },
        { title: 'O que acontece depois que eu termino a triagem?' },
        { title: 'Quando um médico entra na análise?' },
      ],
      [FaqCategory.ACCREDITED_NETWORKS]: [
        { title: 'Como a plataforma escolhe para onde me encaminhar?' },
        { title: 'A recomendação já considera meu plano de saúde?' },
        { title: 'O que acontece depois que recebo a recomendação?' },
        { title: 'A experiência muda de empresa para empresa?' },
      ],
      [FaqCategory.CERTIFICATES]: [
        { title: 'Como envio meu atestado?' },
        { title: 'O que acontece depois que eu envio?' },
        { title: 'Quem valida meu atestado?' },
        { title: 'Onde acompanho o status do meu atestado?' },
      ],
    };

    return topicsMap[category];
  }
}
