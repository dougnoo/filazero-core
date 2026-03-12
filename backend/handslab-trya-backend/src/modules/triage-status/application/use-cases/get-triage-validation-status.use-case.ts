import { Injectable, Inject } from '@nestjs/common';
import type {
  ITriageStatusRepository,
  TriageValidationStatus,
} from '../../domain/interfaces/triage-status.interface';
import { TRIAGE_STATUS_REPOSITORY_TOKEN } from '../../domain/interfaces/triage-status.interface';

@Injectable()
export class GetTriageValidationStatusUseCase {
  constructor(
    @Inject(TRIAGE_STATUS_REPOSITORY_TOKEN)
    private readonly triageStatusRepository: ITriageStatusRepository,
  ) {}

  async execute(
    userId: string,
    tenantId: string,
  ): Promise<TriageValidationStatus> {
    return this.triageStatusRepository.getLatestValidationStatus(
      userId,
      tenantId,
    );
  }
}
