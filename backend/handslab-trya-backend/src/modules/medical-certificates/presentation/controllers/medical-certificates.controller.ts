import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadCertificateUseCase } from '../../application/use-cases/upload-certificate.use-case';
import { ListCertificatesUseCase } from '../../application/use-cases/list-certificates.use-case';
import { ListCertificatesHRUseCase } from '../../application/use-cases/list-certificates-hr.use-case';
import { GetCertificateByIdUseCase } from '../../application/use-cases/get-certificate-by-id.use-case';
import { GetCertificateByIdHRUseCase } from '../../application/use-cases/get-certificate-by-id-hr.use-case';
import { DeleteCertificateUseCase } from '../../application/use-cases/delete-certificate.use-case';
import { UpdateCertificateStatusUseCase } from '../../application/use-cases/update-certificate-status.use-case';
import { UploadCertificateDto } from '../../application/dto/upload-certificate.dto';
import { UploadCertificateResponseDto } from '../../application/dto/upload-certificate-response.dto';
import { UpdateCertificateStatusDto } from '../../application/dto/update-certificate-status.dto';
import { CertificateAnalysisCronService } from '../../application/services/certificate-analysis-cron.service';
import { CurrentUser } from '../../../../shared/presentation/current-user.decorator';
import { Roles } from '../../../../shared/presentation/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { TenantId } from '../../../../shared/presentation/tenant.decorator';
import { Public } from 'src/modules/auth/presentation/decorators/public.decorator';

@ApiTags('medical-certificates')
@ApiBearerAuth('JWT-auth')
@Controller('medical-certificates')
@Roles(UserRole.BENEFICIARY)
export class MedicalCertificatesController {
  constructor(
    private readonly uploadCertificateUseCase: UploadCertificateUseCase,
    private readonly listCertificatesUseCase: ListCertificatesUseCase,
    private readonly listCertificatesHRUseCase: ListCertificatesHRUseCase,
    private readonly getCertificateByIdUseCase: GetCertificateByIdUseCase,
    private readonly getCertificateByIdHRUseCase: GetCertificateByIdHRUseCase,
    private readonly deleteCertificateUseCase: DeleteCertificateUseCase,
    private readonly updateCertificateStatusUseCase: UpdateCertificateStatusUseCase,
    private readonly certificateAnalysisCronService: CertificateAnalysisCronService,
  ) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload de atestado médico' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        observations: {
          type: 'string',
          description: 'Observações sobre o atestado (opcional)',
          maxLength: 500,
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Atestado enviado com sucesso',
    type: UploadCertificateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadCertificateDto,
    @CurrentUser() user: User,
    @TenantId() tenantId?: string,
  ): Promise<UploadCertificateResponseDto> {
    const effectiveUserId = user.dbId || user.id;
    const effectiveTenantId = user.tenantId || tenantId;

    if (!effectiveTenantId) {
      throw new Error('Tenant ID não encontrado');
    }

    const certificate = await this.uploadCertificateUseCase.execute(
      file,
      dto,
      effectiveUserId,
      effectiveTenantId,
    );

    return {
      id: certificate.id,
      fileName: certificate.fileName,
      fileUrl: certificate.fileUrl,
      analysisStatus: certificate.analysisStatus,
      createdAt: certificate.createdAt,
    };
  }

  @Get('hr')
  @Roles(UserRole.HR)
  @ApiOperation({ summary: 'Listar atestados da empresa (RH)' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de atestados com dados do beneficiário',
  })
  async listHR(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('name') name?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
  ) {
    return await this.listCertificatesHRUseCase.execute(
      user.tenantId,
      page,
      limit,
      {
        name,
        date,
        status,
      },
    );
  }

  @Get('hr/:id')
  @Roles(UserRole.HR)
  @ApiOperation({
    summary: 'Buscar atestado por ID (RH) com dados de análise e beneficiário',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes completos do atestado com dados do beneficiário',
  })
  @ApiResponse({ status: 404, description: 'Atestado não encontrado' })
  async getByIdHR(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.getCertificateByIdHRUseCase.execute(id, user.tenantId);
  }

  @Patch('hr/:id/status')
  @Roles(UserRole.HR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar status do atestado (RH)' })
  @ApiResponse({
    status: 200,
    description: 'Status do atestado atualizado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Atestado não encontrado' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCertificateStatusDto,
    @CurrentUser() user: User,
  ) {
    return await this.updateCertificateStatusUseCase.execute(
      id,
      user.tenantId,
      dto.status,
    );
  }

  @Get()
  @Roles(UserRole.BENEFICIARY)
  @ApiOperation({ summary: 'Listar meus atestados' })
  @ApiResponse({ status: 200, description: 'Lista paginada de atestados' })
  async list(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('date') date?: string,
  ) {
    return await this.listCertificatesUseCase.execute(
      user.dbId || user.id,
      user.tenantId,
      page,
      limit,
      { date },
    );
  }

  @Get(':id')
  @Roles(UserRole.BENEFICIARY)
  @ApiOperation({ summary: 'Buscar atestado por ID com dados de análise' })
  @ApiResponse({ status: 200, description: 'Detalhes completos do atestado' })
  @ApiResponse({ status: 404, description: 'Atestado não encontrado' })
  async getById(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.getCertificateByIdUseCase.execute(
      id,
      user.dbId || user.id,
      user.tenantId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar atestado' })
  @ApiResponse({ status: 204, description: 'Atestado deletado' })
  @ApiResponse({ status: 404, description: 'Atestado não encontrado' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.deleteCertificateUseCase.execute(
      id,
      user.dbId || user.id,
      user.tenantId,
    );
  }

  @Post('analyze-pending')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Executar análise de atestados pendentes manualmente',
    description:
      'Trigger manual do processamento de atestados pendentes. Normalmente executado automaticamente via cron a cada hora.',
  })
  @ApiResponse({
    status: 200,
    description: 'Análise de atestados pendentes executada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Análise de atestados pendentes executada com sucesso',
        },
        executedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async analyzePending() {
    await this.certificateAnalysisCronService.analyzePendingCertificates();
    return {
      message: 'Análise de atestados pendentes executada com sucesso',
      executedAt: new Date().toISOString(),
    };
  }
}
