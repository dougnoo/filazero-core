import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesGuard } from '../../../../shared/presentation/roles.guard';
import { Roles } from '../../../../shared/presentation/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { CurrentUser } from '../../../../shared/presentation/current-user.decorator';
import { GetTriageHistoryDto } from '../../application/dtos/triage-history.dto';
import {
  TriageHistoryResponseDto,
  TriageSessionDto,
} from '../../application/dtos/triage-history-response.dto';
import { GetTriageHistoryUseCase } from '../../application/use-cases/get-triage-history.use-case';
import { GetTriageSessionUseCase } from '../../application/use-cases/get-triage-session.use-case';
import { GetActiveSessionUseCase } from '../../application/use-cases/get-active-session.use-case';
import { User } from 'src/modules/auth/domain/entities/user.entity';

@ApiTags('Chat - Histórico de Triagem')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(RolesGuard)
@Roles(UserRole.BENEFICIARY, UserRole.DEPENDENT)
export class TriageHistoryController {
  constructor(
    private readonly getHistoryUseCase: GetTriageHistoryUseCase,
    private readonly getSessionUseCase: GetTriageSessionUseCase,
    private readonly getActiveSessionUseCase: GetActiveSessionUseCase,
  ) {}

  @Get('history')
  @ApiOperation({ summary: 'Listar histórico de triagens do usuário' })
  @ApiResponse({ status: 200, type: TriageHistoryResponseDto })
  async getHistory(
    @CurrentUser() user: User,
    @Query() dto: GetTriageHistoryDto,
  ): Promise<TriageHistoryResponseDto> {
    return this.getHistoryUseCase.execute(
      user.dbId || user.id,
      user.tenantId,
      dto.page || 1,
      dto.limit || 20,
    );
  }

  @Get('history/:sessionId')
  @ApiOperation({ summary: 'Buscar sessão de triagem por ID' })
  @ApiResponse({ status: 200, type: TriageSessionDto })
  @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
  async getSession(
    @CurrentUser() user: any,
    @Param('sessionId') sessionId: string,
  ): Promise<TriageSessionDto> {
    return this.getSessionUseCase.execute(
      sessionId,
      user.dbId || user.id,
      user.tenantId,
    );
  }

  @Get('active-session')
  @ApiOperation({ summary: 'Buscar sessão ativa do usuário' })
  @ApiResponse({
    status: 200,
    type: TriageSessionDto,
    description: 'Sessão ativa encontrada',
  })
  @ApiResponse({
    status: 200,
    description: 'Nenhuma sessão ativa',
    schema: { type: 'null' },
  })
  async getActiveSession(
    @CurrentUser() user: User,
  ): Promise<TriageSessionDto | null> {
    return this.getActiveSessionUseCase.execute(
      user.dbId || user.id,
      user.tenantId,
    );
  }
}
