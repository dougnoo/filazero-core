import {
  Controller,
  Post,
  Put,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiHeader,
  ApiSecurity,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import { User } from '../../auth/domain/entities/user.entity';
import { SaveOnboardUseCase } from '../application/use-cases/save-onboard.use-case';
import { SaveOnboardExternalUseCase } from '../application/use-cases/save-onboard-external.use-case';
import { UpdateHealthDataUseCase } from '../application/use-cases/update-health-data.use-case';
import { SaveOnboardDto } from './dtos/save-onboard.dto';
import { SaveOnboardExternalDto } from './dtos/save-onboard-external.dto';
import { UpdateHealthDataDto } from './dtos/update-health-data.dto';
import { Roles } from 'src/shared/presentation';
import { UserRole } from 'src/shared/domain/enums/user-role.enum';
import { Public } from '../../auth/presentation/decorators/public.decorator';
import { ChatApiKeyGuard } from 'src/shared/presentation/chat-api-key.guard';

@ApiTags('onboard')
@Controller('onboard')
@Roles(UserRole.BENEFICIARY, UserRole.DEPENDENT)
export class OnboardController {
  constructor(
    private readonly saveOnboardUseCase: SaveOnboardUseCase,
    private readonly saveOnboardExternalUseCase: SaveOnboardExternalUseCase,
    private readonly updateHealthDataUseCase: UpdateHealthDataUseCase,
  ) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Salvar dados de onboard do usuário',
    description:
      'Permite ao usuário inserir suas condições crônicas, medicações (com dosagem) e alergias. Esta operação só pode ser realizada uma vez por usuário.',
  })
  @ApiResponse({
    status: 204,
    description: 'Dados de onboard salvos com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 409,
    description: 'Onboard já foi completado anteriormente',
  })
  async saveOnboard(
    @Body() dto: SaveOnboardDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    if (!user.dbId) {
      throw new InternalServerErrorException(
        'Não foi possível identificar o usuário no banco de dados',
      );
    }
    await this.saveOnboardUseCase.execute({
      userId: user.dbId, // Usar UUID do PostgreSQL para buscar o usuário no banco
      chronicConditionIds: dto.chronicConditionIds,
      medications: dto.medications,
      allergies: dto.allergies,
    });
  }

  @ApiSecurity('api-key')
  @Public()
  @UseGuards(ChatApiKeyGuard)
  @Post('external')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API Key para autenticação (chat API key)',
  })
  @ApiOperation({
    summary: 'Salvar dados de onboard via serviço externo',
    description:
      'Permite que um serviço externo insira dados de onboard usando nomes de condições crônicas e medicações ao invés de IDs',
  })
  @ApiResponse({
    status: 204,
    description: 'Dados de onboard salvos com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'API Key inválida' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Onboard já foi completado anteriormente',
  })
  async saveOnboardExternal(
    @Body() dto: SaveOnboardExternalDto,
  ): Promise<void> {
    await this.saveOnboardExternalUseCase.execute({
      userId: dto.userId,
      chronicConditions: dto.chronicConditions,
      medications: dto.medications,
      allergies: dto.allergies,
    });
  }

  @ApiSecurity('api-key')
  @Public()
  @UseGuards(ChatApiKeyGuard)
  @Put('health-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API Key para autenticação (chat API key)',
  })
  @ApiOperation({
    summary: 'Atualizar dados de saúde do usuário',
    description:
      'Permite que um serviço externo (como o chat IA) atualize dados de saúde do usuário. Suporta merge (adiciona aos dados existentes) ou replace (sobrescreve).',
  })
  @ApiResponse({
    status: 204,
    description: 'Dados de saúde atualizados com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'API Key inválida' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateHealthData(@Body() dto: UpdateHealthDataDto): Promise<void> {
    await this.updateHealthDataUseCase.execute({
      userId: dto.userId,
      chronicConditions: dto.chronicConditions,
      medications: dto.medications,
      allergies: dto.allergies,
      merge: dto.merge ?? true,
    });
  }
}
