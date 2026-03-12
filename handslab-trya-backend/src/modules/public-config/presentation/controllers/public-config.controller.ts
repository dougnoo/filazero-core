import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GetBrokerThemeUseCase } from '../../application/use-cases/get-broker-theme/get-broker-theme.use-case';
import { GetBrokerThemeDto } from '../../application/use-cases/get-broker-theme/get-broker-theme.dto';
import { BrokerThemeResponseDto } from '../../application/use-cases/get-broker-theme/get-broker-theme-response.dto';
import { Public } from '../../../auth/presentation/decorators/public.decorator';

@ApiTags('public-config')
@Controller('public')
export class PublicConfigController {
  constructor(private readonly getBrokerThemeUseCase: GetBrokerThemeUseCase) {}

  /**
   * Buscar tema do broker (rota pública)
   * GET /public/broker-theme?tenantName=broken-company
   *
   * Retorna as configurações de tema incluindo:
   * - Cores primária e secundária
   * - URL do logo (para cabeçalho da aplicação)
   * - URL do favicon (ícone do navegador)
   * - URL do background (para página de login)
   */
  @Public()
  @Get('broker-theme')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar tema do broker',
    description:
      'Busca as configurações de tema de um broker específico incluindo cores, logo, favicon e background de login. Rota pública sem necessidade de autenticação.',
  })
  @ApiQuery({
    name: 'tenantName',
    description: 'Nome do tenant/broker',
    example: 'broken-company',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description:
      'Tema do broker encontrado com sucesso. Inclui URLs das imagens (logo, favicon, background) e cores do tema.',
    type: BrokerThemeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Nome do tenant é obrigatório' })
  @ApiResponse({
    status: 404,
    description: 'Tema não encontrado para o tenant',
  })
  async getBrokerTheme(
    @Query() getBrokerThemeDto: GetBrokerThemeDto,
  ): Promise<BrokerThemeResponseDto> {
    return await this.getBrokerThemeUseCase.execute(getBrokerThemeDto);
  }
}
