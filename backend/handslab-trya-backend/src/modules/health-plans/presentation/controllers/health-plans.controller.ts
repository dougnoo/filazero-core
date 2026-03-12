import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ListHealthPlansUseCase } from '../../application/use-cases/list-health-plans.use-case';
import { ListHealthPlansQueryDto } from '../dtos/list-health-plans.query.dto';

@ApiTags('health-plans')
@ApiBearerAuth('JWT-auth')
@Controller('health-plans')
export class HealthPlansController {
  constructor(private readonly listUseCase: ListHealthPlansUseCase) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Listar planos de saúde',
    description:
      'Lista todos os planos de saúde com filtros opcionais por nome e operadora.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos retornada com sucesso',
    schema: {
      example: [
        {
          id: 'uuid-1',
          name: 'Empresarial QC',
        },
        {
          id: 'uuid-2',
          name: 'Essencial',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async list(@Query() query: ListHealthPlansQueryDto) {
    return this.listUseCase.execute(query);
  }
}
