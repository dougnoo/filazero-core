import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ITriageHistoryRepository } from '../../domain/repositories/triage-history.repository.interface';
import { TRIAGE_HISTORY_REPOSITORY_TOKEN } from '../../domain/repositories/triage-history.repository.interface';
import { TriageSessionDto } from '../dtos/triage-history-response.dto';

@Injectable()
export class GetTriageSessionUseCase {
  constructor(
    @Inject(TRIAGE_HISTORY_REPOSITORY_TOKEN)
    private readonly repository: ITriageHistoryRepository,
  ) {}

  async execute(
    sessionId: string,
    userId: string,
    tenantId: string,
  ): Promise<TriageSessionDto> {
    const session = await this.repository.getSession(
      sessionId,
      userId,
      tenantId,
    );

    if (!session) {
      throw new NotFoundException(`Sessão ${sessionId} não encontrada`);
    }

    return TriageSessionDto.fromEntity(session);
  }
}
