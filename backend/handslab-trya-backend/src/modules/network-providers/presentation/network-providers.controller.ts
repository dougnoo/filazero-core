import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetPlansUseCase } from '../application/use-cases/get-plans.use-case';
import { SearchByCpfUseCase } from '../application/use-cases/search-by-cpf.use-case';
import { GetStatesUseCase } from '../application/use-cases/get-states.use-case';
import { GetMunicipalitiesUseCase } from '../application/use-cases/get-municipalities.use-case';
import { GetNeighborhoodsUseCase } from '../application/use-cases/get-neighborhoods.use-case';
import { GetServiceTypesUseCase } from '../application/use-cases/get-service-types.use-case';
import { GetSpecialtiesUseCase } from '../application/use-cases/get-specialties.use-case';
import { SearchProvidersUseCase } from '../application/use-cases/search-providers.use-case';
import { SearchProvidersInstitucionalUseCase } from '../application/use-cases/search-providers-institucional.use-case';
import { SearchNearbyProvidersUseCase } from '../application/use-cases/search-nearby-providers.use-case';
import { SearchByChatUseCase } from '../application/use-cases/search-by-chat.use-case';
import { GetPlansDto } from '../application/dto/get-plans.dto';
import { SearchByCpfDto } from '../application/dto/search-by-cpf.dto';
import { GetMunicipalitiesDto } from '../application/dto/get-municipalities.dto';
import { GetNeighborhoodsDto } from '../application/dto/get-neighborhoods.dto';
import { GetServiceTypesDto } from '../application/dto/get-service-types.dto';
import { GetSpecialtiesDto } from '../application/dto/get-specialties.dto';
import { GetProvidersDto } from '../application/dto/get-providers.dto';
import { SearchNearbyProvidersDto } from '../application/dto/search-nearby-providers.dto';
import { SearchByChatDto } from '../application/dtos/search-by-chat.dto';
import { SearchByChatResponseDto } from '../application/dtos/search-by-chat-response.dto';
import { CurrentUser } from 'src/shared/presentation/current-user.decorator';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { JwtAuthGuard } from 'src/modules/auth/presentation/guards/jwt-auth.guard';
import { Roles, RolesGuard } from 'src/shared/presentation';
import { UserRole } from 'src/shared/domain/enums/user-role.enum';

@ApiTags('Network Providers')
@ApiBearerAuth('JWT-auth')
@Controller('network-providers')
export class NetworkProvidersController {
  constructor(
    private readonly getPlansUseCase: GetPlansUseCase,
    private readonly searchByCpfUseCase: SearchByCpfUseCase,
    private readonly getStatesUseCase: GetStatesUseCase,
    private readonly getMunicipalitiesUseCase: GetMunicipalitiesUseCase,
    private readonly getNeighborhoodsUseCase: GetNeighborhoodsUseCase,
    private readonly getServiceTypesUseCase: GetServiceTypesUseCase,
    private readonly getSpecialtiesUseCase: GetSpecialtiesUseCase,
    private readonly searchProvidersUseCase: SearchProvidersUseCase,
    private readonly searchProvidersInstitucionalUseCase: SearchProvidersInstitucionalUseCase,
    private readonly searchNearbyProvidersUseCase: SearchNearbyProvidersUseCase,
    private readonly searchByChatUseCase: SearchByChatUseCase,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'Listar planos disponíveis da operadora' })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos disponíveis',
  })
  async getPlans(@Query() dto: GetPlansDto) {
    const plans = await this.getPlansUseCase.execute(dto.operadora);
    return plans.map((plan) => ({
      networkCode: plan.networkCode,
      name: plan.name,
      operatorName: plan.operatorName,
    }));
  }

  @Get('plans/search-by-cpf')
  @ApiOperation({ summary: 'Buscar planos por CPF do beneficiário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos encontrados',
  })
  @ApiResponse({
    status: 400,
    description: 'CPF inválido',
  })
  async searchByCpf(@Query() dto: SearchByCpfDto) {
    return this.searchByCpfUseCase.execute(dto.cpf);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BENEFICIARY, UserRole.DEPENDENT)
  @Get('states')
  @ApiOperation({ summary: 'Listar estados disponíveis para a rede' })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados',
  })
  async getEstados(@CurrentUser() user: User) {
    const userId = user.dbId || user.id;
    return this.getStatesUseCase.execute(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BENEFICIARY, UserRole.DEPENDENT)
  @Get('municipalities')
  @ApiOperation({ summary: 'Listar municípios de um estado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de municípios',
  })
  async getMunicipios(
    @Query() dto: GetMunicipalitiesDto,
    @CurrentUser() user: User,
  ) {
    const userId = user.dbId || user.id;
    return this.getMunicipalitiesUseCase.execute(userId, dto.state);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BENEFICIARY, UserRole.DEPENDENT)
  @Get('neighborhoods')
  @ApiOperation({ summary: 'Listar bairros de um município' })
  @ApiResponse({
    status: 200,
    description: 'Lista de bairros',
  })
  async getBairros(
    @Query() dto: GetNeighborhoodsDto,
    @CurrentUser() user: User,
  ) {
    const userId = user.dbId || user.id;
    return this.getNeighborhoodsUseCase.execute(
      userId,
      dto.state,
      dto.municipality,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BENEFICIARY, UserRole.DEPENDENT)
  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias disponíveis' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias',
  })
  async getTiposServico(
    @Query() dto: GetServiceTypesDto,
    @CurrentUser() user: User,
  ) {
    const userId = user.dbId || user.id;
    return this.getServiceTypesUseCase.execute(
      userId,
      dto.state,
      dto.city,
      dto.neighborhood,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BENEFICIARY, UserRole.DEPENDENT)
  @Get('specialties')
  @ApiOperation({ summary: 'Listar especialidades disponíveis' })
  @ApiResponse({
    status: 200,
    description: 'Lista de especialidades',
  })
  async getEspecialidades(
    @Query() dto: GetSpecialtiesDto,
    @CurrentUser() user: User,
  ) {
    const userId = user.dbId || user.id;
    return this.getSpecialtiesUseCase.execute(
      userId,
      dto.state,
      dto.city,
      dto.neighborhood,
      dto.category,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BENEFICIARY, UserRole.DEPENDENT)
  @Get('providers')
  @ApiOperation({ summary: 'Listar locais de atendimento credenciados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de locais de atendimento',
  })
  async searchProviders(
    @Query() dto: GetProvidersDto,
    @CurrentUser() user: User,
  ) {
    const userId = user.dbId || user.id;
    return this.searchProvidersInstitucionalUseCase.execute({
      userId,
      state: dto.state,
      city: dto.city,
      category: dto.category,
      specialty: dto.specialty,
      neighborhood: dto.neighborhood,
      page: dto.page,
      limit: dto.limit,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BENEFICIARY, UserRole.DEPENDENT)
  @Get('providers/nearby')
  @ApiOperation({ summary: 'Buscar locais de atendimento próximos por GPS' })
  @ApiResponse({
    status: 200,
    description: 'Lista de locais de atendimento próximos',
  })
  async searchNearbyProviders(
    @Query() dto: SearchNearbyProvidersDto,
    @CurrentUser() user: User,
  ) {
    const userId = user.dbId || user.id;
    return this.searchNearbyProvidersUseCase.execute({
      userId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      searchText: dto.searchText,
      distanceKm: dto.distanceKm,
      page: dto.page,
      limit: dto.limit,
    });
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BENEFICIARY, UserRole.DEPENDENT)
  @Post('chat')
  @ApiOperation({
    summary: 'Buscar rede credenciada por chat',
    description:
      'Busca prestadores próximos usando linguagem natural. A IA extrai a especialidade da mensagem e retorna os locais mais próximos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado da busca com mensagem e lista de locais',
    type: SearchByChatResponseDto,
  })
  async searchByChat(
    @Body() dto: SearchByChatDto,
    @CurrentUser() user: User,
  ): Promise<SearchByChatResponseDto> {
    const userId = user.dbId || user.id;
    return this.searchByChatUseCase.execute(userId, dto);
  }
}
