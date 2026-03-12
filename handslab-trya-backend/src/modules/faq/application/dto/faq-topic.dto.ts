import { ApiProperty } from '@nestjs/swagger';
import { FaqCategory } from '../../domain/entities/faq-question.entity';

export class FaqTopicDto {
  @ApiProperty({
    example: 'O que é a Plataforma Trya?',
    description: 'Título do tópico',
  })
  title: string;
}

export class FaqTopicsResponseDto {
  @ApiProperty({
    enum: FaqCategory,
    example: FaqCategory.GENERAL,
    description: 'Categoria dos tópicos',
  })
  category: FaqCategory;

  @ApiProperty({
    type: [FaqTopicDto],
    description: 'Lista de tópicos da categoria',
  })
  topics: FaqTopicDto[];
}
