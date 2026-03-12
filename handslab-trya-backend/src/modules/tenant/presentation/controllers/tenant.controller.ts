import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateTenantDto } from '../../application/use-cases/create-tenant/create-tenant.dto';
import { CreateTenantResponseDto } from '../../application/use-cases/create-tenant/create-tenant-response.dto';
import { CreateTenantUseCase } from '../../application/use-cases/create-tenant/create-tenant.use-case';
import { ListTenantsUseCase } from '../../application/use-cases/list-tenants/list-tenants.use-case';
import { ListTenantsResponseDto } from '../../application/use-cases/list-tenants/list-tenants-response.dto';
import { GetTenantUseCase } from '../../application/use-cases/get-tenant/get-tenant.use-case';
import { UpdateTenantOperatorUseCase } from '../../application/use-cases/update-tenant-operator/update-tenant-operator.use-case';
import { UpdateTenantOperatorDto } from '../../application/use-cases/update-tenant-operator/update-tenant-operator.dto';
import { UpdateTenantOperatorResponseDto } from '../../application/use-cases/update-tenant-operator/update-tenant-operator-response.dto';
import { Tenant } from '../../../../database/entities/tenant.entity';
import { Roles } from '../../../../shared/presentation/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { CurrentUser } from '../../../../shared/presentation/current-user.decorator';
import { User } from 'src/modules/auth/domain/entities/user.entity';

@ApiTags('tenants')
@Controller('tenants')
@ApiBearerAuth('JWT-auth')
export class TenantController {
  constructor(
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly listTenantsUseCase: ListTenantsUseCase,
    private readonly getTenantUseCase: GetTenantUseCase,
    private readonly updateTenantOperatorUseCase: UpdateTenantOperatorUseCase,
  ) {}

  /**
   * Criar uma nova empresa/tenant (apenas SUPER_ADMIN)
   * POST /tenants
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar nova empresa/tenant',
    description:
      'Cria uma nova empresa no sistema. Apenas SUPER_ADMIN pode executar esta ação. Valida CNPJ e garante unicidade.',
  })
  @ApiResponse({
    status: 201,
    description: 'Empresa criada com sucesso',
    type: CreateTenantResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Dados inválidos (CNPJ inválido, campos obrigatórios ausentes, etc.)',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (não é SUPER_ADMIN)',
  })
  @ApiResponse({ status: 409, description: 'CNPJ ou nome já cadastrado' })
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @CurrentUser() user: User,
  ): Promise<CreateTenantResponseDto> {
    return await this.createTenantUseCase.execute({
      ...createTenantDto,
      userId: user?.id,
    });
  }

  /**
   * Listar todas as empresas/tenants
   * GET /tenants
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR)
  @ApiOperation({
    summary: 'Listar empresas/tenants',
    description:
      'Lista todas as empresas cadastradas no sistema. HR vê apenas seu tenant. Retorna apenas ID e nome.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empresas (apenas ID e nome)',
    type: [ListTenantsResponseDto],
    schema: {
      example: [
        { id: 'dd6f2fce-c6f5-46e1-bf58-abb1e52d4832', name: 'Grupo Trigo' },
        { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Clínica Saúde' },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async list(
    @Query('activeOnly') activeOnly?: string,
    @CurrentUser() user?: User,
  ): Promise<ListTenantsResponseDto[]> {
    const active = activeOnly !== 'false';
    return await this.listTenantsUseCase.execute(
      active,
      user?.role,
      user?.tenantId,
    );
  }

  /**
   * Buscar empresa/tenant por ID
   * GET /tenants/:id
   */
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Buscar empresa por ID',
    description:
      'Retorna os dados de uma empresa específica. SUPER_ADMIN e ADMIN podem visualizar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados da empresa',
    type: Tenant,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  async getById(@Param('id') id: string): Promise<Tenant> {
    return await this.getTenantUseCase.execute(id);
  }

  /**
   * Atualizar operadora do tenant
   * PATCH /tenants/:id/operator
   */
  @Patch(':id/operator')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Alterar operadora do tenant',
    description:
      'Altera a operadora vinculada ao tenant. A nova operadora deve estar habilitada (com rede credenciada disponível). A alteração tem efeito imediato nas consultas de rede credenciada.',
  })
  @ApiResponse({
    status: 200,
    description: 'Operadora alterada com sucesso',
    type: UpdateTenantOperatorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Operadora não encontrada ou não habilitada',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  async updateOperator(
    @Param('id') tenantId: string,
    @Body() dto: UpdateTenantOperatorDto,
    @CurrentUser() user: User,
  ): Promise<UpdateTenantOperatorResponseDto> {
    return await this.updateTenantOperatorUseCase.execute({
      tenantId,
      operatorId: dto.operatorId,
      userId: user?.id,
    });
  }
}
