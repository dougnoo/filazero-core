import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ITermVersionRepository } from '../../../domain/repositories/term-version.repository.interface';
import { TERM_VERSION_REPOSITORY_TOKEN } from '../../../domain/repositories/term-version.repository.interface';
import type { IFileStorageService } from '../../../domain/services/file-storage.service.interface';
import { FILE_STORAGE_SERVICE_TOKEN } from '../../../domain/services/file-storage.service.interface';
import { UploadTermDto } from './upload-term.dto';
import { UploadTermResponseDto } from './upload-term-response.dto';
import { DuplicateTermVersionError } from '../../../domain/errors/duplicate-term-version.error';

@Injectable()
export class UploadTermUseCase {
  private readonly logger = new Logger(UploadTermUseCase.name);

  constructor(
    @Inject(TERM_VERSION_REPOSITORY_TOKEN)
    private readonly termVersionRepository: ITermVersionRepository,
    @Inject(FILE_STORAGE_SERVICE_TOKEN)
    private readonly fileStorageService: IFileStorageService,
  ) {}

  async execute(
    dto: UploadTermDto,
    file: Express.Multer.File,
    uploadedBy?: string,
  ): Promise<UploadTermResponseDto> {
    this.logger.log(`Fazendo upload do termo: ${dto.type}`);

    const latest = await this.termVersionRepository.findLatestByType(dto.type);
    const newVersion =
      dto.version?.trim() || this.generateNextVersion(latest?.version);

    this.logger.log(`Nova versão gerada: ${newVersion}`);

    // Verifica se já existe um termo com essa versão
    const existingTerm = await this.termVersionRepository.findByTypeAndVersion(
      dto.type,
      newVersion,
    );

    if (existingTerm) {
      this.logger.warn(
        `Tentativa de criar termo duplicado: ${dto.type} v${newVersion}`,
      );
      throw new DuplicateTermVersionError(newVersion, dto.type);
    }

    const s3Key = `public/terms/${dto.type.toLowerCase()}/${newVersion}.pdf`;
    const s3Url = await this.fileStorageService.uploadFile(
      s3Key,
      file.buffer,
      'application/pdf',
    );

    const saved = await this.termVersionRepository.save({
      type: dto.type,
      version: newVersion,
      s3Key,
      s3Url,
      isActive: false,
      effectiveDate: dto.effectiveDate
        ? new Date(dto.effectiveDate)
        : undefined,
      changeDescription: dto.changeDescription,
      uploadedBy,
    });

    this.logger.log(`Termo salvo: ${saved.id} v${saved.version}`);

    return {
      id: saved.id,
      type: saved.type,
      version: saved.version,
      s3Url: saved.s3Url,
      isActive: saved.isActive,
    };
  }

  private generateNextVersion(currentVersion?: string): string {
    if (!currentVersion) {
      return '1';
    }

    const version = parseInt(currentVersion, 10);
    return `${version + 1}`;
  }
}
