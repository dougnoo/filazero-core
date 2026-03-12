import { ApiProperty } from '@nestjs/swagger';
import { FaqCategory } from '../../domain/entities/faq-question.entity';

export class FaqResponseDto {
  @ApiProperty({
    example: 'Como faço para acessar a plataforma?',
    description: 'Pergunta original do usuário',
  })
  question: string;

  @ApiProperty({
    enum: FaqCategory,
    example: FaqCategory.GENERAL,
    description: 'Categoria da pergunta',
  })
  category: FaqCategory;

  @ApiProperty({
    example:
      'Para acessar a Plataforma Trya, basta entrar no link enviado pela sua empresa...',
    description: 'Resposta gerada pela IA',
  })
  answer: string;
}
