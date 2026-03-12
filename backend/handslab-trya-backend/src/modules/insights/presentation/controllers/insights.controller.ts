import {
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../../shared/presentation/current-user.decorator';
import { Roles } from '../../../../shared/presentation/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { TenantInterceptor } from '../../../../shared/presentation/tenant.interceptor';
import { GetHealthInsightsUseCase } from '../../application/use-cases/get-health-insights.use-case';
import { HealthInsightsResponseDto } from '../../application/dto/health-insights-response.dto';

interface CurrentUserPayload {
  dbId: string;
  tenantId: string;
}

@ApiTags('Insights')
@ApiBearerAuth()
@Controller('insights')
@UseInterceptors(TenantInterceptor)
@Roles(UserRole.BENEFICIARY)
export class InsightsController {
  constructor(
    private readonly getHealthInsightsUseCase: GetHealthInsightsUseCase,
  ) {}

  @Get('health')
  @ApiOperation({
    summary: 'Obter insights de saúde',
    description:
      'Retorna alertas, documentos prestes a vencer, estatísticas e resumo de saúde dos membros da família',
  })
  @ApiResponse({ status: 200, type: HealthInsightsResponseDto })
  async getHealthInsights(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<HealthInsightsResponseDto> {
    return this.getHealthInsightsUseCase.execute({
      ownerUserId: user.dbId,
      tenantId: user.tenantId,
    });
  }
}
