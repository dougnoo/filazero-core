import {
  Controller,
  Get,
  Param,
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
import { GetFamilySidebarUseCase } from '../../application/use-cases/get-family-sidebar.use-case';
import { FamilySidebarResponseDto } from '../../application/dto/family-sidebar-response.dto';
import { GetFamilyDashboardUseCase } from '../../application/use-cases/get-family-dashboard.use-case';
import { FamilyDashboardResponseDto } from '../../application/dto/family-dashboard-response.dto';
import { GetFamilyMemberDashboardUseCase } from '../../application/use-cases/get-family-member-dashboard.use-case';
import { FamilyMemberDashboardResponseDto } from '../../application/dto/family-member-dashboard-response.dto';


interface CurrentUserPayload {
  dbId: string;
  tenantId: string;
}

@ApiTags('Family Management')
@ApiBearerAuth()
@Controller('family-management')
@UseInterceptors(TenantInterceptor)
@Roles(UserRole.BENEFICIARY)
export class FamilyManagementController {
  constructor(
    private readonly getFamilySidebarUseCase: GetFamilySidebarUseCase,
    private readonly getFamilyDashboardUseCase: GetFamilyDashboardUseCase,
    private readonly getFamilyMemberDashboardUseCase: GetFamilyMemberDashboardUseCase,
  ) {}

  @Get('members')
  @ApiOperation({
    summary: 'Lista membros para menu lateral da família',
    description:
      'Retorna os dados do titular e dependentes com relacionamento e idade para o menu lateral',
  })
  @ApiResponse({ status: 200, type: FamilySidebarResponseDto })
  async getMembers(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<FamilySidebarResponseDto> {
    return this.getFamilySidebarUseCase.execute({
      ownerUserId: user.dbId,
    });
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Obter dados do dashboard da família',
    description:
      'Retorna estatísticas de documentos, distribuição por categoria e lembretes de documentos vencidos ou prestes a vencer',
  })
  @ApiResponse({ status: 200, type: FamilyDashboardResponseDto })
  async getDashboard(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<FamilyDashboardResponseDto> {
    return this.getFamilyDashboardUseCase.execute({
      ownerUserId: user.dbId,
    });
  }

  @Get('dashboard/:memberId')
  @ApiOperation({
    summary: 'Obter dados do dashboard de um membro específico da família',
    description:
      'Retorna informações do membro, estatísticas de documentos, distribuição por tipo e lembretes de documentos vencidos ou prestes a vencer para um membro específico',
  })
  @ApiResponse({ status: 200, type: FamilyMemberDashboardResponseDto })
  async getMemberDashboard(
    @CurrentUser() user: CurrentUserPayload,
    @Param('memberId') memberId: string,
  ): Promise<FamilyMemberDashboardResponseDto> {
    return this.getFamilyMemberDashboardUseCase.execute({
      ownerUserId: user.dbId,
      memberId,
    });
  }
}
