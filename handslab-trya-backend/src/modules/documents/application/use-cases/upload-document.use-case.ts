import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { DOCUMENT_REPOSITORY_TOKEN } from '../../domain/repositories/document.repository.interface';
import { DocumentStorageService } from '../../infrastructure/services/document-storage.service';
// import { OpenSearchService } from '../../infrastructure/services/opensearch.service';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { User } from '../../../../database/entities/user.entity';
import { isValidCategory } from '../../domain/catalog/document-catalog';
import { IAuditRepository } from '../../../../shared/domain/repositories/audit.repository.interface';
import { AuditEventType } from '../../../../database/entities/audit-event.entity';
import { TimelineService } from '../../../timeline/application/services/timeline.service';

export interface UploadDocumentInput {
  dto: UploadDocumentDto;
  file: Express.Multer.File;
  ownerUserId: string;
  tenantId: string;
}

@Injectable()
export class UploadDocumentUseCase {
  private readonly logger = new Logger(UploadDocumentUseCase.name);

  constructor(
    @Inject(DOCUMENT_REPOSITORY_TOKEN)
    private readonly documentRepository: IDocumentRepository,
    private readonly storageService: DocumentStorageService,
    // private readonly openSearchService: OpenSearchService,
    private readonly timelineService: TimelineService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditRepository: IAuditRepository,
  ) {}

  async execute(input: UploadDocumentInput): Promise<{ id: string }> {
    const { dto, file, ownerUserId, tenantId } = input;

    await this.validateMemberBelongsToOwner(
      dto.memberUserId,
      ownerUserId,
      tenantId,
    );

    if (!isValidCategory(dto.documentType, dto.category)) {
      throw new BadRequestException(
        `A categoria "${dto.category}" não é válida para o tipo de documento "${dto.documentType}"`,
      );
    }

    const uploadResult = await this.storageService.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      tenantId,
      ownerUserId,
      dto.memberUserId,
    );

    const document = await this.documentRepository.create({
      tenantId,
      ownerUserId,
      memberUserId: dto.memberUserId,
      documentType: dto.documentType,
      category: dto.category,
      title: dto.title,
      issueDate: new Date(dto.issueDate),
      validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      notes: dto.notes || null,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      s3Key: uploadResult.s3Key,
    });

    await this.auditRepository.create({
      eventType: AuditEventType.DOCUMENT_UPLOADED,
      entityType: 'medical_documents',
      entityId: document.id,
      userId: ownerUserId,
      payload: {
        documentType: dto.documentType,
        category: dto.category,
        memberUserId: dto.memberUserId,
        fileName: file.originalname,
      },
    });

    // if (this.openSearchService.isEnabled()) {
    //   await this.openSearchService.indexDocument(document);
    // }

    await this.timelineService.registerDocumentUploaded(document);

    this.logger.log(
      `Documento ${document.id} criado pelo usuário ${ownerUserId}`,
    );

    return { id: document.id };
  }

  private async validateMemberBelongsToOwner(
    memberUserId: string,
    ownerUserId: string,
    tenantId: string,
  ): Promise<void> {
    if (memberUserId === ownerUserId) {
      return;
    }

    const owner = await this.userRepository.findOne({
      where: { id: ownerUserId, tenantId },
      relations: ['dependents'],
    });

    if (!owner) {
      throw new ForbiddenException('Usuário titular não encontrado');
    }

    const isDependent = owner.dependents?.some(
      (dep) => dep.id === memberUserId,
    );

    if (!isDependent) {
      throw new ForbiddenException(
        'O membro selecionado não pertence à sua família',
      );
    }
  }
}
