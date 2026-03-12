import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import type { ITermVersionRepository } from '../../../domain/repositories/term-version.repository.interface';
import { TERM_VERSION_REPOSITORY_TOKEN } from '../../../domain/repositories/term-version.repository.interface';

export interface ReprocessTermDto {
  id: string;
}

export interface ReprocessTermResponseDto {
  id: string;
  type: string;
  version: string;
  message: string;
}

@Injectable()
export class ReprocessTermUseCase {
  private readonly logger = new Logger(ReprocessTermUseCase.name);

  constructor(
    @Inject(TERM_VERSION_REPOSITORY_TOKEN)
    private readonly termVersionRepository: ITermVersionRepository,
  ) {}

  async execute(dto: ReprocessTermDto): Promise<ReprocessTermResponseDto> {
    const term = await this.termVersionRepository.findById(dto.id);

    if (!term) {
      throw new NotFoundException('Termo não encontrado');
    }

    this.logger.log(`Reprocessando termo: ${term.type} v${term.version}`);

    await this.termVersionRepository.deactivateAllByType(term.type);

    await this.termVersionRepository.save({
      ...term,
      isActive: true,
    });

    this.logger.log(`Termo reprocessado com sucesso: ${term.type} v${term.version}`);

    return {
      id: term.id,
      type: term.type,
      version: term.version,
      message: `Termo ${term.type} versão ${term.version} reprocessado com sucesso`,
    };
  }
}
