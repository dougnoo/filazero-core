import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ListHealthOperatorsUseCase } from '../../application/use-cases/list-health-operators.use-case';
import { CreateHealthOperatorUseCase } from '../../application/use-cases/create-health-operator.use-case';
import { ListHealthOperatorsQueryDto } from '../dtos/list-health-operators.query.dto';
import { CreateHealthOperatorDto } from '../dtos/create-health-operator.dto';
import { CreateHealthOperatorResponseDto } from '../dtos/create-health-operator-response.dto';
import { Roles } from '../../../../shared/presentation/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { HealthOperatorStatus } from '../../../../shared/domain/enums/health-operator-status.enum';
import { CurrentUser } from '../../../../shared/presentation/current-user.decorator';
import { User } from '../../../auth/domain/entities/user.entity';

@ApiTags('health-operators')
@ApiBearerAuth('JWT-auth')
@Controller('health-operators')
export class HealthOperatorsController {
  constructor(
    private readonly listUseCase: ListHealthOperatorsUseCase,
    private readonly createUseCase: CreateHealthOperatorUseCase,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Listar operadoras de plano de saúde',
    description:
      'Lista todas as operadoras de plano de saúde com filtros opcionais por nome e status habilitado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de operadoras retornada com sucesso',
    schema: {
      example: [
        {
          id: 'uuid-1',
          name: 'Amil',
          status: HealthOperatorStatus.REDE_CREDENCIADA_DISPONIVEL,
        },
        {
          id: 'uuid-2',
          name: 'Bradesco Saúde',
          status: HealthOperatorStatus.CADASTRADA,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async list(@Query() query: ListHealthOperatorsQueryDto) {
    return this.listUseCase.execute(query);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Cadastrar nova operadora de saúde',
    description:
      'Cria uma nova operadora com status CADASTRADA. Apenas SUPER_ADMIN e ADMIN podem executar.',
  })
  @ApiResponse({
    status: 201,
    description: 'Operadora criada com sucesso',
    type: CreateHealthOperatorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 409, description: 'Operadora já existe' })
  async create(
    @Body() dto: CreateHealthOperatorDto,
    @CurrentUser() user: User,
  ): Promise<CreateHealthOperatorResponseDto> {
    return this.createUseCase.execute({
      name: dto.name,
      userId: user?.id,
    });
  }
}
