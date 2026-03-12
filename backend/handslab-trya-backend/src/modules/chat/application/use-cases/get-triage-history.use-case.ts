import { Injectable, Inject } from '@nestjs/common';
import type { ITriageHistoryRepository } from '../../domain/repositories/triage-history.repository.interface';
import { TRIAGE_HISTORY_REPOSITORY_TOKEN } from '../../domain/repositories/triage-history.repository.interface';
import {
  TriageHistoryResponseDto,
  TriageHistoryItemDto,
} from '../dtos/triage-history-response.dto';

@Injectable()
export class GetTriageHistoryUseCase {
  constructor(
    @Inject(TRIAGE_HISTORY_REPOSITORY_TOKEN)
    private readonly repository: ITriageHistoryRepository,
  ) {}

  async execute(
    userId: string,
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<TriageHistoryResponseDto> {
    const result = await this.repository.getHistory(
      userId,
      tenantId,
      page,
      limit,
    );

    return {
      items: result.items.map((item) => TriageHistoryItemDto.fromEntity(item)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
