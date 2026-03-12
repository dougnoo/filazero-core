import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ListIntegrationsUseCase } from '../application/use-cases/list-integrations.use-case';
import { CreateIntegrationUseCase } from '../application/use-cases/create-integration.use-case';
import { GenerateMagicLinkUseCase } from '../application/use-cases/generate-magic-link.use-case';
import { GetConsultationHistoryUseCase } from '../application/use-cases/get-consultation-history.use-case';
import { CreateIntegrationDto } from '../application/dto/create-integration.dto';
import { IntegrationType } from '../domain/enums/integration-type.enum';
import { Roles } from 'src/shared/presentation';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import { UserRole } from 'src/shared/domain/enums/user-role.enum';
import { User } from 'src/modules/auth/domain/entities/user.entity';

@ApiTags('integrations')
@Controller('integrations/telemedicine')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.ADMIN)
export class TelemedicineController {
  constructor(
    private readonly listIntegrationsUseCase: ListIntegrationsUseCase,
    private readonly createIntegrationUseCase: CreateIntegrationUseCase,
    private readonly generateMagicLinkUseCase: GenerateMagicLinkUseCase,
    private readonly getConsultationHistoryUseCase: GetConsultationHistoryUseCase,
  ) {
    console.log(
      'TelemedicineController initialized - Routes: POST /config, GET /, POST /magic-link, GET /consultations',
    );
  }

  @Roles(UserRole.ADMIN)
  @Post('config')
  @ApiOperation({ summary: 'Create telemedicine integration configuration' })
  @ApiResponse({ status: 201, description: 'Integration created successfully' })
  async createIntegration(
    @Body() dto: CreateIntegrationDto,
    @CurrentUser() user: User,
  ) {
    return this.createIntegrationUseCase.execute(
      { ...dto, type: IntegrationType.TELEMEDICINE },
      user.tenantId,
    );
  }

  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List telemedicine providers' })
  @ApiResponse({
    status: 200,
    description: 'List of available telemedicine providers',
  })
  async listProviders(@CurrentUser() user: User) {
    return this.listIntegrationsUseCase.execute(
      IntegrationType.TELEMEDICINE,
      user.tenantId,
    );
  }

  @Roles(UserRole.BENEFICIARY)
  @Post('magic-link')
  @ApiOperation({
    summary:
      'Generate patient magic link (uses first available telemedicine provider)',
  })
  async generateMagicLink(@CurrentUser() user: User) {
    return this.generateMagicLinkUseCase.execute(user.dbId || user.id, user.tenantId);
  }

  @Roles(UserRole.BENEFICIARY)
  @Get('consultations')
  @ApiOperation({ summary: 'Get consultation history' })
  @ApiResponse({
    status: 200,
    description: 'Consultation history retrieved successfully',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getConsultations(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ) {
    return this.getConsultationHistoryUseCase.execute(
      user.id,
      user.tenantId,
      limit,
    );
  }
}
