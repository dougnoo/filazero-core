import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Public } from '../../../auth/presentation/decorators/public.decorator';
import { GetLatestTermUseCase } from '../../application/use-cases/get-latest-term/get-latest-term.use-case';
import { GetLatestTermResponseDto } from '../../application/use-cases/get-latest-term/get-latest-term-response.dto';
import { GetTermByIdUseCase } from '../../application/use-cases/get-term-by-id/get-term-by-id.use-case';
import { GetTermByIdResponseDto } from '../../application/use-cases/get-term-by-id/get-term-by-id-response.dto';

@ApiTags('public-terms')
@Controller('public/terms')
export class PublicTermsController {
  constructor(
    private readonly getLatestTermUseCase: GetLatestTermUseCase,
    private readonly getTermByIdUseCase: GetTermByIdUseCase,
  ) {}

  @Get('latest')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar últimas versões ativas de todos os termos (público)',
    description: 'Endpoint público para consumo pelo platform backend',
  })
  @ApiResponse({
    status: 200,
    description: 'Termos ativos encontrados',
    type: [GetLatestTermResponseDto],
  })
  async getLatest(): Promise<GetLatestTermResponseDto[]> {
    return await this.getLatestTermUseCase.execute();
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOperation({
    summary: 'Buscar termo por ID (público)',
    description: 'Endpoint público para consumo pelo platform backend',
  })
  @ApiResponse({
    status: 200,
    description: 'Termo encontrado',
    type: GetTermByIdResponseDto,
  })
  async getById(@Param('id') id: string): Promise<GetTermByIdResponseDto> {
    return await this.getTermByIdUseCase.execute(id);
  }
}
