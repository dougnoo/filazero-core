import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import type { ITermVersionRepository } from '../../../domain/repositories/term-version.repository.interface';
import { TERM_VERSION_REPOSITORY_TOKEN } from '../../../domain/repositories/term-version.repository.interface';
import { ActivateTermDto } from './activate-term.dto';

@Injectable()
export class ActivateTermUseCase {
  private readonly logger = new Logger(ActivateTermUseCase.name);

  constructor(
    @Inject(TERM_VERSION_REPOSITORY_TOKEN)
    private readonly termVersionRepository: ITermVersionRepository,
  ) {}

  async execute(dto: ActivateTermDto): Promise<void> {
    const term = await this.termVersionRepository.findById(dto.id);

    if (!term) {
      throw new NotFoundException('Term version not found');
    }

    this.logger.log(`Ativando termo: ${term.type} v${term.version}`);

    await this.termVersionRepository.deactivateAllByType(term.type);

    await this.termVersionRepository.save({
      ...term,
      isActive: true,
    });

    this.logger.log(`Termo ativado: ${term.type} v${term.version}`);
  }
}
