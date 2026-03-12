import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import type { ITermVersionRepository } from '../../../domain/repositories/term-version.repository.interface';
import { TERM_VERSION_REPOSITORY_TOKEN } from '../../../domain/repositories/term-version.repository.interface';
import { GetTermByIdResponseDto } from './get-term-by-id-response.dto';

@Injectable()
export class GetTermByIdUseCase {
  private readonly logger = new Logger(GetTermByIdUseCase.name);

  constructor(
    @Inject(TERM_VERSION_REPOSITORY_TOKEN)
    private readonly termVersionRepository: ITermVersionRepository,
  ) {}

  async execute(id: string): Promise<GetTermByIdResponseDto> {
    this.logger.log(`Buscando termo por ID: ${id}`);

    const term = await this.termVersionRepository.findById(id);

    if (!term) {
      throw new NotFoundException(`Termo com ID ${id} não encontrado`);
    }

    return {
      id: term.id,
      type: term.type,
      version: term.version,
      s3Url: term.s3Url,
      isActive: term.isActive,
      effectiveDate: term.effectiveDate,
      changeDescription: term.changeDescription,
      uploadedBy: term.uploadedBy,
      createdAt: term.createdAt!,
    };
  }
}
