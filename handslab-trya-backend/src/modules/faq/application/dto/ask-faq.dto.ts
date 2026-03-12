import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FaqCategory } from '../../domain/entities/faq-question.entity';

export class AskFaqDto {
  @ApiProperty({
    example: 'Como faço para acessar a plataforma?',
    description: 'Pergunta do usuário',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    enum: FaqCategory,
    example: FaqCategory.GENERAL,
    description: 'Categoria da pergunta',
  })
  @IsEnum(FaqCategory)
  @IsNotEmpty()
  category: FaqCategory;
}
