import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { ParseOptionalBooleanPipe } from '../../../../shared/pipes/parse-boolean.pipe';
import { CreateAdminUseCase } from '../../application/use-cases/create-admin/create-admin.use-case';
import { CreateHrUseCase } from '../../application/use-cases/create-hr/create-hr.use-case';
import { CreateBeneficiaryUseCase } from '../../application/use-cases/create-beneficiary/create-beneficiary.use-case';
import { CreateDoctorUseCase } from '../../application/use-cases/create-doctor/create-doctor.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users/list-users.use-case';
import { ListBeneficiariesUseCase } from '../../application/use-cases/list-beneficiaries/list-beneficiaries.use-case';
import { GetBeneficiaryUseCase } from '../../application/use-cases/get-beneficiary/get-beneficiary.use-case';
import { GetBeneficiaryResponseDto } from '../../application/use-cases/get-beneficiary/get-beneficiary-response.dto';
import { UpdateBeneficiaryUseCase } from '../../application/use-cases/update-beneficiary/update-beneficiary.use-case';
import { UpdateHrUseCase } from '../../application/use-cases/update-hr/update-hr.use-case';
import { UpdateHrDto } from '../../application/use-cases/update-hr/update-hr.dto';
import { UpdateUserUseCase } from '../../application/use-cases/update-user/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user/delete-user.use-case';
import { DeactivateBeneficiaryUseCase } from '../../application/use-cases/deactivate-beneficiary/deactivate-beneficiary.use-case';
import { DeactivateBeneficiaryDto } from '../../application/use-cases/deactivate-beneficiary/deactivate-beneficiary.dto';
import { DeactivateBeneficiaryResponseDto } from '../../application/use-cases/deactivate-beneficiary/deactivate-beneficiary-response.dto';
import { DeactivateHrUseCase } from '../../application/use-cases/deactivate-hr/deactivate-hr.use-case';
import { DeactivateHrResponseDto } from '../../application/use-cases/deactivate-hr/deactivate-hr-response.dto';
import { ListEmployeesUseCase } from '../../application/use-cases/list-employees/list-employees.use-case';
import { ListEmployeesDto } from '../../application/use-cases/list-employees/list-employees.dto';
import { PaginatedListEmployeesResponseDto } from '../../application/use-cases/list-employees/paginated-list-employees-response.dto';
import { CreateAdminDto } from '../../application/use-cases/create-admin/create-admin.dto';
import { CreateAdminResponseDto } from '../../application/use-cases/create-admin/create-admin-response.dto';
import { CreateHrDto } from '../../application/use-cases/create-hr/create-hr.dto';
import { CreateHrResponseDto } from '../../application/use-cases/create-hr/create-hr-response.dto';
import { CreateBeneficiaryDto } from '../../application/use-cases/create-beneficiary/create-beneficiary.dto';
import { CreateBeneficiaryResponseDto } from '../../application/use-cases/create-beneficiary/create-beneficiary-response.dto';
import { ImportBeneficiariesUseCase } from '../../application/use-cases/import-beneficiaries/import-beneficiaries.use-case';
import {
  ImportBeneficiariesDto,
  ImportResultDto,
} from '../../application/dtos/import-beneficiaries.dto';
import { CreateDoctorDto } from '../../application/use-cases/create-doctor/create-doctor.dto';
import { CreateDoctorResponseDto } from '../../application/use-cases/create-doctor/create-doctor-response.dto';
import { ListUsersDto } from '../../application/use-cases/list-users/list-users.dto';
import { ListBeneficiariesDto } from '../../application/use-cases/list-beneficiaries/list-beneficiaries.dto';
import { PaginatedListBeneficiariesResponseDto } from '../../application/use-cases/list-beneficiaries/paginated-list-beneficiaries-response.dto';
import { UpdateBeneficiaryDto } from '../../application/use-cases/update-beneficiary/update-beneficiary.dto';
import { UpdateBeneficiaryResponseDto } from '../../application/use-cases/update-beneficiary/update-beneficiary-response.dto';
import { UpdateUserDto } from '../../application/use-cases/update-user/update-user.dto';
import { RolesGuard } from '../../../../shared/presentation/roles.guard';
import { Roles } from '../../../../shared/presentation/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { User } from 'src/modules/auth/domain/entities/user.entity';

@ApiTags('user-management')
@Controller('users')
@UseGuards(RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UserManagementController {
  constructor(
    private readonly createAdminUseCase: CreateAdminUseCase,
    private readonly createHrUseCase: CreateHrUseCase,
    private readonly createBeneficiaryUseCase: CreateBeneficiaryUseCase,
    private readonly createDoctorUseCase: CreateDoctorUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly listBeneficiariesUseCase: ListBeneficiariesUseCase,
    private readonly getBeneficiaryUseCase: GetBeneficiaryUseCase,
    private readonly updateBeneficiaryUseCase: UpdateBeneficiaryUseCase,
    private readonly updateHrUseCase: UpdateHrUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly deactivateBeneficiaryUseCase: DeactivateBeneficiaryUseCase,
    private readonly deactivateHrUseCase: DeactivateHrUseCase,
    private readonly listEmployeesUseCase: ListEmployeesUseCase,
    private readonly importBeneficiariesUseCase: ImportBeneficiariesUseCase,
  ) {}

  /**
   * Criar um novo admin (apenas SUPER_ADMIN)
   * POST /users/admin
   */
  @Post('admin')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Criar novo admin',
    description:
      'Cria um novo usuário com role de ADMIN. Apenas SUPER_ADMIN pode executar esta ação.',
  })
  @ApiResponse({
    status: 201,
    description: 'Admin criado com sucesso',
    type: CreateAdminResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (não é SUPER_ADMIN)',
  })
  @ApiResponse({ status: 409, description: 'Usuário já existe' })
  async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
  ): Promise<CreateAdminResponseDto> {
    return await this.createAdminUseCase.execute(createAdminDto);
  }

  /**
   * Criar um novo usuário do RH (apenas ADMIN)
   * POST /users/hr
   */
  @Post('hr')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Criar novo usuário do RH',
    description:
      'Cria um novo usuário com role de HR. SUPER_ADMIN, ADMIN e HR podem executar. TenantId é obrigatório para SUPER_ADMIN/ADMIN, HR usa o próprio tenant.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário do RH criado com sucesso',
    type: CreateHrResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos (CPF inválido, data inválida, etc.)',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({
    status: 409,
    description: 'Email ou CPF já cadastrado no sistema',
  })
  async createHr(
    @Body() createHrDto: CreateHrDto,
    @CurrentUser() currentUser: User,
  ): Promise<CreateHrResponseDto> {
    return await this.createHrUseCase.execute(createHrDto, currentUser);
  }

  /**
   * Criar um novo beneficiário (ADMIN e HR)
   * POST /users/beneficiary
   */
  @Post('beneficiary')
  @Roles(UserRole.ADMIN, UserRole.HR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Criar novo beneficiário',
    description:
      'Cria um novo usuário com role de BENEFICIARY. ADMIN e HR podem executar esta ação. Valida CPF e salva no PostgreSQL.',
  })
  @ApiResponse({
    status: 200,
    description: 'Beneficiário criado com sucesso',
    type: CreateBeneficiaryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos (CPF inválido, data inválida, etc.)',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (não é ADMIN ou HR)',
  })
  @ApiResponse({
    status: 409,
    description: 'Email ou CPF já cadastrado no sistema',
  })
  async createBeneficiary(
    @Body() createBeneficiaryDto: CreateBeneficiaryDto,
    @CurrentUser() currentUser: User,
  ): Promise<CreateBeneficiaryResponseDto> {
    return await this.createBeneficiaryUseCase.execute(
      createBeneficiaryDto,
      currentUser,
    );
  }

  /**
   * Importar beneficiários via planilha (ADMIN e HR)
   * POST /users/beneficiaries/import
   */
  @Post('beneficiaries/import')
  @Roles(UserRole.ADMIN, UserRole.HR)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Importar beneficiários via planilha Excel/CSV',
    description:
      'Importa múltiplos beneficiários de uma planilha. TenantId vem do token do usuário autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Importação concluída',
    type: ImportResultDto,
  })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async importBeneficiaries(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: User,
  ): Promise<ImportResultDto> {
    return await this.importBeneficiariesUseCase.execute(file, currentUser);
  }

  /**
   * Criar um novo médico (apenas SUPER_ADMIN)
   * POST /users/doctor
   */
  @Post('doctor')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Criar novo médico',
    description:
      'Cria um novo usuário com role de DOCTOR. Apenas SUPER_ADMIN pode executar esta ação.',
  })
  @ApiResponse({
    status: 200,
    description: 'Médico criado com sucesso',
    type: CreateDoctorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (não é SUPER_ADMIN)',
  })
  @ApiResponse({ status: 409, description: 'Usuário já existe' })
  async createDoctor(
    @Body() createDoctorDto: CreateDoctorDto,
  ): Promise<CreateDoctorResponseDto> {
    return await this.createDoctorUseCase.execute(createDoctorDto);
  }

  /**
   * Listar usuários (SUPER_ADMIN e ADMIN)
   * GET /users
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Listar usuários',
    description:
      'Lista usuários com filtros opcionais. SUPER_ADMIN pode ver todos, ADMIN apenas do seu tenant.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async listUsers(@Query() listUsersDto: ListUsersDto) {
    return await this.listUsersUseCase.execute(listUsersDto);
  }

  /**
   * Listar beneficiários (SUPER_ADMIN, ADMIN e HR)
   * GET /users/beneficiaries
   */
  @Get('beneficiaries')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR)
  @ApiOperation({
    summary: 'Listar beneficiários',
    description:
      'Lista todos os beneficiários cadastrados no sistema. HR vê apenas do seu tenant. Permite busca por nome/CPF/email e filtro por status ativo/inativo.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Busca por nome, CPF ou email',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filtrar por status: true (ativos) ou false (inativos)',
  })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: 'Filtrar por tenant (apenas SUPER_ADMIN e ADMIN)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de beneficiários',
    type: PaginatedListBeneficiariesResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async listBeneficiaries(
    @CurrentUser() currentUser: User,
    @Query() dto: ListBeneficiariesDto,
  ): Promise<PaginatedListBeneficiariesResponseDto> {
    return await this.listBeneficiariesUseCase.execute(dto, currentUser);
  }

  /**
   * Buscar beneficiário por ID (SUPER_ADMIN, ADMIN e HR)
   * GET /users/beneficiaries/:id
   */
  @Get('beneficiaries/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR)
  @ApiOperation({
    summary: 'Buscar beneficiário por ID',
    description:
      'Retorna informações detalhadas de um beneficiário específico.',
  })
  @ApiParam({ name: 'id', description: 'ID do beneficiário (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Beneficiário encontrado',
    type: GetBeneficiaryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Beneficiário não encontrado' })
  async getBeneficiary(
    @Param('id') id: string,
  ): Promise<GetBeneficiaryResponseDto> {
    return await this.getBeneficiaryUseCase.execute(id);
  }

  /**
   * Atualizar beneficiário (SUPER_ADMIN, ADMIN e HR)
   * PUT /users/beneficiaries/:id
   */
  @Put('beneficiaries/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Atualizar beneficiário',
    description:
      'Atualiza informações de um beneficiário. Permite editar nome, CPF, data de nascimento, email, telefone, empresa e plano de saúde.',
  })
  @ApiParam({ name: 'id', description: 'ID do beneficiário (UUID)' })
  @ApiResponse({
    status: 204,
    description:
      'Beneficiário atualizado com sucesso (sem conteúdo na resposta)',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos (CPF inválido, email inválido, etc.)',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Beneficiário não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'CPF ou email já cadastrado no sistema',
  })
  async updateBeneficiary(
    @Param('id') id: string,
    @Body() updateBeneficiaryDto: UpdateBeneficiaryDto,
  ): Promise<void> {
    await this.updateBeneficiaryUseCase.execute(id, updateBeneficiaryDto);
  }

  /**
   * Atualizar usuário RH (SUPER_ADMIN, ADMIN e HR)
   * PUT /users/hr/:id
   */
  @Put('hr/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Atualizar usuário RH',
    description:
      'Atualiza informações de um usuário RH. Permite editar nome, CPF, data de nascimento, email e telefone.',
  })
  @ApiParam({ name: 'id', description: 'ID do usuário RH (UUID)' })
  @ApiResponse({
    status: 204,
    description: 'Usuário RH atualizado com sucesso (sem conteúdo na resposta)',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos (CPF inválido, email inválido, etc.)',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário RH não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'CPF ou email já cadastrado no sistema',
  })
  async updateHr(
    @Param('id') id: string,
    @Body() updateHrDto: UpdateHrDto,
  ): Promise<void> {
    await this.updateHrUseCase.execute(id, updateHrDto);
  }

  /**
   * Listar funcionários (HR e Beneficiários)
   * GET /users/employees
   */
  @Get('employees')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR)
  @ApiOperation({
    summary: 'Listar funcionários (HR e Beneficiários)',
    description:
      'Lista HR e Beneficiários com informações da empresa. HR vê apenas do seu tenant.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Busca por nome, CPF ou email',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filtrar por status: true (ativos) ou false (inativos)',
  })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: 'Filtrar por tenant (apenas SUPER_ADMIN e ADMIN)',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: UserRole,
    description: 'Filtrar por tipo: HR ou BENEFICIARY',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de funcionários',
    type: PaginatedListEmployeesResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async listEmployees(
    @CurrentUser() currentUser: User,
    @Query() dto: ListEmployeesDto,
  ): Promise<PaginatedListEmployeesResponseDto> {
    return await this.listEmployeesUseCase.execute(dto, currentUser);
  }

  /**
   * Buscar usuário por email (SUPER_ADMIN e ADMIN)
   * GET /users/:email
   */
  @Get(':email')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Buscar usuário por email',
    description: 'Busca um usuário específico pelo email.',
  })
  @ApiParam({ name: 'email', description: 'Email do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserByEmail(@Param('email') email: string) {
    // Implementar busca individual se necessário
    return { message: 'Funcionalidade de busca individual será implementada' };
  }

  /**
   * Atualizar usuário (SUPER_ADMIN e ADMIN)
   * PUT /users/:email
   */
  @Put(':email')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Atualizar usuário',
    description: 'Atualiza informações de um usuário existente.',
  })
  @ApiParam({ name: 'email', description: 'Email do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateUser(
    @Param('email') email: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.updateUserUseCase.execute(email, updateUserDto);
  }

  /**
   * Deletar usuário (apenas SUPER_ADMIN)
   * DELETE /users/:email
   */
  @Delete(':email')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar usuário',
    description:
      'Remove um usuário do sistema. Apenas SUPER_ADMIN pode executar esta ação.',
  })
  @ApiParam({ name: 'email', description: 'Email do usuário' })
  @ApiResponse({ status: 204, description: 'Usuário deletado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (não é SUPER_ADMIN)',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async deleteUser(@Param('email') email: string): Promise<void> {
    await this.deleteUserUseCase.execute(email);
  }

  /**
   * Desativar beneficiário (ADMIN e HR)
   * DELETE /users/beneficiaries/:id
   */
  @Delete('beneficiaries/:id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desativar beneficiário',
    description:
      'Desativa um beneficiário no Cognito e no banco de dados. ADMIN e HR podem executar esta ação.',
  })
  @ApiParam({ name: 'id', description: 'ID do beneficiário (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Beneficiário desativado com sucesso',
    type: DeactivateBeneficiaryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (não é ADMIN ou HR)',
  })
  @ApiResponse({ status: 404, description: 'Beneficiário não encontrado' })
  async deactivateBeneficiary(
    @Param('id') id: string,
  ): Promise<DeactivateBeneficiaryResponseDto> {
    return await this.deactivateBeneficiaryUseCase.execute({ id });
  }

  /**
   * Desativar usuário RH (ADMIN e HR)
   * DELETE /users/hr/:id
   */
  @Delete('hr/:id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desativar usuário RH',
    description:
      'Desativa um usuário RH no Cognito e no banco de dados. ADMIN e HR podem executar, mas HR não pode desativar a si mesmo.',
  })
  @ApiParam({ name: 'id', description: 'ID do usuário RH (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Usuário RH desativado com sucesso',
    type: DeactivateHrResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão ou tentativa de auto-desativação',
  })
  @ApiResponse({ status: 404, description: 'Usuário RH não encontrado' })
  async deactivateHr(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<DeactivateHrResponseDto> {
    return await this.deactivateHrUseCase.execute({ id }, currentUser);
  }
}
