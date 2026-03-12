import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Req,
  Param,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Roles } from '../../../../shared/presentation/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { UploadTermUseCase } from '../../application/use-cases/upload-term/upload-term.use-case';
import { UploadTermDto } from '../../application/use-cases/upload-term/upload-term.dto';
import { UploadTermResponseDto } from '../../application/use-cases/upload-term/upload-term-response.dto';
import { GetLatestTermUseCase } from '../../application/use-cases/get-latest-term/get-latest-term.use-case';
import { GetLatestTermResponseDto } from '../../application/use-cases/get-latest-term/get-latest-term-response.dto';
import { AcceptTermUseCase } from '../../application/use-cases/accept-term/accept-term.use-case';
import { AcceptTermDto } from '../../application/use-cases/accept-term/accept-term.dto';
import { AcceptTermResponseDto } from '../../application/use-cases/accept-term/accept-term-response.dto';
import { CheckTermAcceptanceUseCase } from '../../application/use-cases/check-term-acceptance/check-term-acceptance.use-case';
import { GetTermHistoryUseCase } from '../../application/use-cases/get-term-history/get-term-history.use-case';
import { GetTermHistoryResponseDto } from '../../application/use-cases/get-term-history/get-term-history-response.dto';
import { GetTermByIdUseCase } from '../../application/use-cases/get-term-by-id/get-term-by-id.use-case';
import { GetTermByIdResponseDto } from '../../application/use-cases/get-term-by-id/get-term-by-id-response.dto';
import { ActivateTermUseCase } from '../../application/use-cases/activate-term/activate-term.use-case';
import {
  ReprocessTermUseCase,
  ReprocessTermResponseDto,
} from '../../application/use-cases/reprocess-term/reprocess-term.use-case';
import { TermType } from '../../../../database/entities/term-version.entity';
import { Public } from '../../../auth/presentation/decorators/public.decorator';
import { User } from 'src/modules/auth/domain/entities/user.entity';

@ApiTags('terms')
@Controller('terms')
@ApiBearerAuth('JWT-auth')
export class TermsController {
  constructor(
    private readonly uploadTermUseCase: UploadTermUseCase,
    private readonly getLatestTermUseCase: GetLatestTermUseCase,
    private readonly acceptTermUseCase: AcceptTermUseCase,
    private readonly checkTermAcceptanceUseCase: CheckTermAcceptanceUseCase,
    private readonly getTermHistoryUseCase: GetTermHistoryUseCase,
    private readonly getTermByIdUseCase: GetTermByIdUseCase,
    private readonly activateTermUseCase: ActivateTermUseCase,
    private readonly reprocessTermUseCase: ReprocessTermUseCase,
  ) {}

  @Post('upload')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['TERMS_OF_USE', 'PRIVACY_POLICY'] },
        version: { type: 'string', example: '2' },
        effectiveDate: { type: 'string', format: 'date' },
        changeDescription: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({
    summary: 'Upload de termo de uso ou política de privacidade',
    description: 'Faz upload de um PDF de termo para o S3 e registra a versão no banco.',
  })
  @ApiResponse({
    status: 200,
    description: 'Termo enviado com sucesso',
    type: UploadTermResponseDto,
  })
  async uploadTerm(
    @Body() dto: UploadTermDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ): Promise<UploadTermResponseDto> {
    const uploadedBy = user.email || user.id;
    return await this.uploadTermUseCase.execute(dto, file, uploadedBy);
  }

  @Get('latest')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar últimas versões ativas de todos os termos' })
  @ApiResponse({
    status: 200,
    description: 'Termos encontrados',
    type: [GetLatestTermResponseDto],
  })
  async getLatest(): Promise<GetLatestTermResponseDto[]> {
    return await this.getLatestTermUseCase.execute();
  }

  @Get('missing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar termos pendentes de aceite do usuário',
    description:
      'Retorna lista de termos que o usuário autenticado ainda não aceitou. Vazio se todos os termos estiverem aceitos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Termos pendentes retornados',
    type: [GetLatestTermResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getMissing(
    @CurrentUser() user: User,
  ): Promise<GetLatestTermResponseDto[]> {
    const missing = await this.checkTermAcceptanceUseCase.execute(user.id);
    return missing.map((term) => ({
      id: term.id,
      type: term.type,
      version: term.version,
      s3Url: term.s3Url,
      isActive: true,
      createdAt: new Date(),
    }));
  }

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aceitar termo',
    description:
      'Registra aceite de termo pelo usuário. Se já aceito, retorna mensagem informando.',
  })
  @ApiResponse({
    status: 200,
    description: 'Termo aceito ou já aceito anteriormente',
    type: AcceptTermResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async acceptTerm(
    @CurrentUser() user: User,
    @Body() dto: AcceptTermDto,
    @Req() req: any,
  ): Promise<AcceptTermResponseDto> {
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userId = user.dbId || user.id;
    return await this.acceptTermUseCase.execute(userId, dto, ipAddress);
  }

  @Get('history')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'type', enum: TermType })
  @ApiOperation({ summary: 'Buscar histórico de versões de um tipo de termo' })
  @ApiResponse({
    status: 200,
    description: 'Histórico de termos',
    type: [GetTermHistoryResponseDto],
  })
  async getHistory(
    @Query('type') type: TermType,
  ): Promise<GetTermHistoryResponseDto[]> {
    return await this.getTermHistoryUseCase.execute(type);
  }

  @Get('list')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'type', enum: TermType, required: true })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'status', type: String, required: false })
  @ApiOperation({ summary: 'Listar termos com paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de termos',
  })
  async listTerms(
    @Query('type') type: TermType,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const allTerms = await this.getTermHistoryUseCase.execute(type);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const termsWithStatus = allTerms
      .map((term) => {
        const effectiveDate = term.effectiveDate
          ? new Date(term.effectiveDate)
          : null;
        if (effectiveDate) {
          effectiveDate.setHours(0, 0, 0, 0);
        }

        const isEffective = effectiveDate ? effectiveDate <= today : false;

        return {
          ...term,
          effectiveDateNormalized: effectiveDate,
          calculatedStatus: isEffective ? 'COMPLETO' : 'PENDENTE',
        };
      })
      .sort((a, b) => {
        const dateA = a.effectiveDateNormalized?.getTime() || 0;
        const dateB = b.effectiveDateNormalized?.getTime() || 0;

        if (dateA !== dateB) {
          return dateB - dateA;
        }

        const createdA = a.createdAt?.getTime() || 0;
        const createdB = b.createdAt?.getTime() || 0;
        return createdB - createdA;
      });

    const effectiveTermsOnToday = termsWithStatus.filter((term) => {
      const effectiveDate = term.effectiveDateNormalized;
      return effectiveDate && effectiveDate.getTime() === today.getTime();
    });

    const activeTermId =
      effectiveTermsOnToday.length > 0
        ? effectiveTermsOnToday.sort((a, b) => {
            const createdA = a.createdAt?.getTime() || 0;
            const createdB = b.createdAt?.getTime() || 0;
            return createdB - createdA;
          })[0]?.id
        : termsWithStatus.find((t) => t.calculatedStatus === 'COMPLETO')?.id;

    const termsWithFinalStatus = termsWithStatus.map((term) => ({
      ...term,
      finalStatus:
        term.id === activeTermId ? 'COMPLETO' : term.calculatedStatus,
    }));

    let filteredTerms = termsWithFinalStatus;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTerms = filteredTerms.filter(
        (term) =>
          term.version.toLowerCase().includes(searchLower) ||
          (term.uploadedBy &&
            term.uploadedBy.toLowerCase().includes(searchLower)),
      );
    }

    if (status) {
      filteredTerms = filteredTerms.filter((term) => {
        if (status === 'COMPLETO') return term.finalStatus === 'COMPLETO';
        if (status === 'PENDENTE') return term.finalStatus === 'PENDENTE';
        return true;
      });
    }

    const pageNum = parseInt(page || '1', 10);
    const pageSizeNum = parseInt(pageSize || '10', 10);
    const total = filteredTerms.length;
    const totalPages = Math.ceil(total / pageSizeNum);

    const startIndex = (pageNum - 1) * pageSizeNum;
    const endIndex = startIndex + pageSizeNum;
    const paginatedItems = filteredTerms.slice(startIndex, endIndex);

    const items = paginatedItems.map((term) => ({
      id: term.id,
      type: term.type,
      version: term.version,
      effectiveDate: term.effectiveDate
        ? new Date(term.effectiveDate).toISOString().split('T')[0]
        : null,
      uploadedBy: term.uploadedBy || 'Sistema',
      uploadDate: term.createdAt.toISOString().split('T')[0],
      status: term.finalStatus,
      s3Url: term.s3Url,
    }));

    return {
      items,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages,
    };
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOperation({ summary: 'Buscar detalhes de uma versão específica' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do termo',
    type: GetTermByIdResponseDto,
  })
  async getById(@Param('id') id: string): Promise<GetTermByIdResponseDto> {
    return await this.getTermByIdUseCase.execute(id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOperation({ summary: 'Ativar uma versão específica de termo' })
  @ApiResponse({
    status: 200,
    description: 'Termo ativado com sucesso',
  })
  async activate(@Param('id') id: string): Promise<void> {
    return await this.activateTermUseCase.execute({ id });
  }

  @Post(':id/reprocess')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOperation({
    summary: 'Reprocessar uma versão específica de termo',
    description:
      'Reprocessa o termo selecionado, desativando outros termos do mesmo tipo e ativando este.',
  })
  @ApiResponse({
    status: 200,
    description: 'Termo reprocessado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Termo não encontrado',
  })
  async reprocess(@Param('id') id: string): Promise<ReprocessTermResponseDto> {
    return await this.reprocessTermUseCase.execute({ id });
  }
}
