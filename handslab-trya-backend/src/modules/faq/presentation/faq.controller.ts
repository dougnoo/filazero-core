import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AskFaqUseCase } from '../application/use-cases/ask-faq.use-case';
import { ListFaqTopicsUseCase } from '../application/use-cases/list-faq-topics.use-case';
import { AskFaqDto } from '../application/dto/ask-faq.dto';
import { FaqResponseDto } from '../application/dto/faq-response.dto';
import { FaqTopicsResponseDto } from '../application/dto/faq-topic.dto';
import { FaqCategory } from '../domain/entities/faq-question.entity';

@ApiTags('faq')
@Controller('faq')
export class FaqController {
  constructor(
    private readonly askFaqUseCase: AskFaqUseCase,
    private readonly listFaqTopicsUseCase: ListFaqTopicsUseCase,
  ) {}

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fazer uma pergunta ao FAQ',
    description:
      'Envia uma pergunta e recebe resposta processada pela IA (AWS Bedrock)',
  })
  @ApiResponse({
    status: 200,
    description: 'Resposta gerada com sucesso',
    type: FaqResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async ask(@Body() dto: AskFaqDto): Promise<FaqResponseDto> {
    return await this.askFaqUseCase.execute(dto);
  }

  @Get('topics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar tópicos por categoria',
    description: 'Retorna todos os tópicos de FAQ de uma categoria específica',
  })
  @ApiQuery({
    name: 'category',
    enum: FaqCategory,
    required: true,
    description: 'Categoria dos tópicos',
  })
  @ApiResponse({
    status: 200,
    description: 'Tópicos listados com sucesso',
    type: FaqTopicsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Categoria inválida' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  listTopics(@Query('category') category: FaqCategory): FaqTopicsResponseDto {
    return this.listFaqTopicsUseCase.execute(category);
  }
}
