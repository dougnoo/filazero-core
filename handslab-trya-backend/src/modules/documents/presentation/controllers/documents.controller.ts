import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/presentation/current-user.decorator';
import { Roles } from '../../../../shared/presentation/roles.decorator';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';
import { TenantInterceptor } from '../../../../shared/presentation/tenant.interceptor';
import { PrimaryBeneficiaryGuard } from '../guards/primary-beneficiary.guard';
import { UploadDocumentUseCase } from '../../application/use-cases/upload-document.use-case';
import { ListDocumentsUseCase } from '../../application/use-cases/list-documents.use-case';
import { GetDocumentByIdUseCase } from '../../application/use-cases/get-document-by-id.use-case';
import { GetDocumentDownloadUseCase } from '../../application/use-cases/get-document-download.use-case';
import { DeleteDocumentUseCase } from '../../application/use-cases/delete-document.use-case';
import { GetFamilyMembersUseCase } from '../../application/use-cases/get-family-members.use-case';
import { GetDocumentCatalogUseCase } from '../../application/use-cases/get-document-catalog.use-case';
import { UploadDocumentDto } from '../../application/dto/upload-document.dto';
import { ListDocumentsQueryDto } from '../../application/dto/list-documents-query.dto';
import {
  PaginatedDocumentsResponseDto,
  DocumentDetailDto,
  DocumentDownloadDto,
  FamilyMembersResponseDto,
  DocumentCatalogResponseDto,
} from '../../application/dto/document-response.dto';

interface CurrentUserPayload {
  dbId: string;
  tenantId: string;
}

const TEN_MB = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

class FileTypeValidatorCustom implements PipeTransform {
  transform(value: Express.Multer.File) {
    if (!ALLOWED_MIME_TYPES.includes(value.mimetype)) {
      throw new BadRequestException(
        `File type ${value.mimetype} not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      );
    }
    return value;
  }
}

@ApiTags('Documentos')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(PrimaryBeneficiaryGuard)
@UseInterceptors(TenantInterceptor)
@Roles(UserRole.BENEFICIARY)
export class DocumentsController {
  constructor(
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    private readonly listDocumentsUseCase: ListDocumentsUseCase,
    private readonly getDocumentByIdUseCase: GetDocumentByIdUseCase,
    private readonly getDocumentDownloadUseCase: GetDocumentDownloadUseCase,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
    private readonly getFamilyMembersUseCase: GetFamilyMembersUseCase,
    private readonly getDocumentCatalogUseCase: GetDocumentCatalogUseCase,
  ) {}

  @Get('members')
  @ApiOperation({
    summary: 'Lista membros da família',
    description:
      'Retorna o titular e seus dependentes para seleção no upload de documentos',
  })
  @ApiResponse({ status: 200, type: FamilyMembersResponseDto })
  async getMembers(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<FamilyMembersResponseDto> {
    return this.getFamilyMembersUseCase.execute({
      ownerUserId: user.dbId,
      tenantId: user.tenantId,
    });
  }

  @Get('catalog')
  @ApiOperation({
    summary: 'Retorna catálogo de tipos e categorias',
    description:
      'Retorna os tipos de documentos e suas respectivas categorias para preencher os selects',
  })
  @ApiResponse({ status: 200, type: DocumentCatalogResponseDto })
  getCatalog(): DocumentCatalogResponseDto {
    return this.getDocumentCatalogUseCase.execute();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Faz upload de um documento',
    description: 'Aceita arquivos PDF, JPG ou PNG com até 10MB',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'file',
        'memberUserId',
        'documentType',
        'category',
        'title',
        'issueDate',
      ],
      properties: {
        file: { type: 'string', format: 'binary' },
        memberUserId: { type: 'string', format: 'uuid' },
        documentType: { type: 'string' },
        category: { type: 'string' },
        title: { type: 'string' },
        issueDate: { type: 'string', format: 'date' },
        validUntil: { type: 'string', format: 'date' },
        notes: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, schema: { properties: { id: { type: 'string' } } } })
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: TEN_MB }),
        ],
      }),
      new FileTypeValidatorCustom(),
    )
    file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ id: string }> {
    return this.uploadDocumentUseCase.execute({
      dto,
      file,
      ownerUserId: user.dbId,
      tenantId: user.tenantId,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Lista documentos',
    description:
      'Lista documentos de um membro da família com filtros e paginação',
  })
  @ApiResponse({ status: 200, type: PaginatedDocumentsResponseDto })
  async list(
    @Query() query: ListDocumentsQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PaginatedDocumentsResponseDto> {
    return this.listDocumentsUseCase.execute({
      query,
      ownerUserId: user.dbId,
      tenantId: user.tenantId,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retorna detalhes de um documento',
    description: 'Inclui URL temporária para visualização',
  })
  @ApiResponse({ status: 200, type: DocumentDetailDto })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DocumentDetailDto> {
    return this.getDocumentByIdUseCase.execute({
      documentId: id,
      ownerUserId: user.dbId,
      tenantId: user.tenantId,
    });
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Gera link de download',
    description: 'Retorna URL temporária autenticada com Content-Disposition',
  })
  @ApiResponse({ status: 200, type: DocumentDownloadDto })
  async getDownload(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DocumentDownloadDto> {
    return this.getDocumentDownloadUseCase.execute({
      documentId: id,
      ownerUserId: user.dbId,
      tenantId: user.tenantId,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove um documento',
    description: 'Remove o documento do S3 e do banco de dados',
  })
  @ApiResponse({ status: 204, description: 'Documento removido com sucesso' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.deleteDocumentUseCase.execute({
      documentId: id,
      ownerUserId: user.dbId,
      tenantId: user.tenantId,
    });
  }
}
