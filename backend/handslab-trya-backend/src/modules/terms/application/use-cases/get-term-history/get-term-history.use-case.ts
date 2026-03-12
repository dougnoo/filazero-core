import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ITermVersionRepository } from '../../../domain/repositories/term-version.repository.interface';
import { TERM_VERSION_REPOSITORY_TOKEN } from '../../../domain/repositories/term-version.repository.interface';
import { TermType } from '../../../../../database/entities/term-version.entity';
import { GetTermHistoryResponseDto } from './get-term-history-response.dto';

@Injectable()
export class GetTermHistoryUseCase {
  private readonly logger = new Logger(GetTermHistoryUseCase.name);

  constructor(
    @Inject(TERM_VERSION_REPOSITORY_TOKEN)
    private readonly termVersionRepository: ITermVersionRepository,
  ) {}

  async execute(type: TermType): Promise<GetTermHistoryResponseDto[]> {
    this.logger.log(`Buscando histórico de termos: ${type}`);

    const terms = await this.termVersionRepository.findAllByType(type);

    return terms.map((term) => ({
      id: term.id,
      type: term.type,
      version: term.version,
      s3Url: term.s3Url,
      isActive: term.isActive,
      effectiveDate: term.effectiveDate,
      changeDescription: term.changeDescription,
      uploadedBy: term.uploadedBy,
      createdAt: term.createdAt!,
    }));
  }
}
