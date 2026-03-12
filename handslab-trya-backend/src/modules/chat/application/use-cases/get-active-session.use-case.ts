import { Injectable, Inject } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import type { ITriageHistoryRepository } from '../../domain/repositories/triage-history.repository.interface';
import { TRIAGE_HISTORY_REPOSITORY_TOKEN } from '../../domain/repositories/triage-history.repository.interface';
import { TriageSessionDto } from '../dtos/triage-history-response.dto';

@Injectable()
export class GetActiveSessionUseCase {
  private readonly logger = new Logger(GetActiveSessionUseCase.name);
  constructor(
    @Inject(TRIAGE_HISTORY_REPOSITORY_TOKEN)
    private readonly repository: ITriageHistoryRepository,
  ) {}

  async execute(
    userId: string,
    tenantId: string,
  ): Promise<TriageSessionDto | null> {
    this.logger.log(`Iniciando busca de sessão ativa para userId=${userId}, tenantId=${tenantId}`);
    const session = await this.repository.getActiveSession(userId, tenantId);    

    if (!session) {
      this.logger.warn(`Nenhuma sessão ativa encontrada para userId=${userId}, tenantId=${tenantId}`);
      return null;
    }

    this.logger.log(`Sessão ativa encontrada e retornada para userId=${userId}, tenantId=${tenantId}, sessionId=${session.sessionId}`);
    return TriageSessionDto.fromEntity(session);
  }
}
