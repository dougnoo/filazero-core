import {
  Controller,
  Get,
  Query,
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
import { ListTimelineUseCase } from '../../application/use-cases/list-timeline.use-case';
import { ListTimelineQueryDto } from '../../application/dto/list-timeline-query.dto';
import { PaginatedTimelineResponseDto } from '../../application/dto/timeline-response.dto';

interface CurrentUserPayload {
  dbId: string;
  tenantId: string;
}

@ApiTags('Timeline')
@ApiBearerAuth()
@Controller('timeline')
@UseInterceptors(TenantInterceptor)
@Roles(UserRole.BENEFICIARY)
export class TimelineController {
  constructor(private readonly listTimelineUseCase: ListTimelineUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Lista eventos da timeline de saúde',
    description: 'Retorna a timeline de eventos de saúde. Se memberUserId não for informado, retorna eventos do titular e seus dependentes. Se informado, retorna apenas do membro especificado.',
  })
  @ApiResponse({ status: 200, type: PaginatedTimelineResponseDto })
  async list(
    @Query() query: ListTimelineQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PaginatedTimelineResponseDto> {
    return this.listTimelineUseCase.execute({
      query,
      ownerUserId: user.dbId,
      tenantId: user.tenantId,
    });
  }
}
