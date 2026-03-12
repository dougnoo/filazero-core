import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetPendingTutorialsUseCase } from '../../application/use-cases/get-pending-tutorials.use-case';
import { CompleteTutorialUseCase } from '../../application/use-cases/complete-tutorial.use-case';
import { CreateTutorialUseCase } from '../../application/use-cases/create-tutorial.use-case';
import { CompleteTutorialDto } from '../dtos/complete-tutorial.dto';
import { CreateTutorialDto } from '../dtos/create-tutorial.dto';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import { Roles } from '../../../../shared/presentation/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { TenantId } from '../../../../shared/presentation/tenant.decorator';

@ApiTags('tutorials')
@ApiBearerAuth()
@Controller('tutorials')
export class TutorialController {
  constructor(
    private readonly getPendingTutorialsUseCase: GetPendingTutorialsUseCase,
    private readonly completeTutorialUseCase: CompleteTutorialUseCase,
    private readonly createTutorialUseCase: CreateTutorialUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new tutorial' })
  @ApiResponse({ status: 201, description: 'Tutorial created successfully' })
  @ApiResponse({ status: 409, description: 'Tutorial code already exists' })
  async create(@Body() dto: CreateTutorialDto) {
    return this.createTutorialUseCase.execute(dto);
  }

  @Get('pending')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.BENEFICIARY, UserRole.DEPENDENT)
  @ApiOperation({ summary: 'Get pending tutorials for current user' })
  @ApiResponse({ status: 200, description: 'List of pending tutorials' })
  async getPending(
    @CurrentUser() user: User,
    @TenantId() tenantId: string | undefined,
  ) {
    // Se não conseguimos resolver o tenant, retornar lista vazia (200)
    // em vez de deixar estourar erro 500
    if (!tenantId) {
      return [];
    }

    return this.getPendingTutorialsUseCase.execute({
      email: user.email,
      tenantId: tenantId,
      role: user.role,
    });
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.BENEFICIARY, UserRole.DEPENDENT)
  @ApiOperation({ summary: 'Mark tutorial as completed or skipped' })
  @ApiResponse({ status: 200, description: 'Tutorial completed successfully' })
  @ApiResponse({ status: 404, description: 'Tutorial not found' })
  async complete(
    @Param('id') tutorialId: string,
    @Body() dto: CompleteTutorialDto,
    @CurrentUser() user: User,
    @TenantId() tenantId: string | undefined,
  ) {
    // Usar tenantId resolvido do decorator (mais robusto)
    const resolvedTenantId = tenantId || user.tenantId;

    return this.completeTutorialUseCase.execute({
      email: user.email,
      tutorialId,
      tenantId: resolvedTenantId,
      skipped: dto.skipped,
    });
  }
}
