import { Injectable, Inject } from '@nestjs/common';
import type { ITermVersionRepository } from '../../../domain/repositories/term-version.repository.interface';
import { TERM_VERSION_REPOSITORY_TOKEN } from '../../../domain/repositories/term-version.repository.interface';
import type { ITermAcceptanceRepository } from '../../../domain/repositories/term-acceptance.repository.interface';
import { TERM_ACCEPTANCE_REPOSITORY_TOKEN } from '../../../domain/repositories/term-acceptance.repository.interface';
import { TermType } from '../../../../../database/entities/term-version.entity';
import { MissingTermAcceptanceDto } from './missing-term-acceptance.dto';

@Injectable()
export class CheckTermAcceptanceUseCase {
  constructor(
    @Inject(TERM_VERSION_REPOSITORY_TOKEN)
    private readonly termVersionRepository: ITermVersionRepository,
    @Inject(TERM_ACCEPTANCE_REPOSITORY_TOKEN)
    private readonly termAcceptanceRepository: ITermAcceptanceRepository,
  ) {}

  async execute(userId: string): Promise<MissingTermAcceptanceDto[]> {
    const missing: MissingTermAcceptanceDto[] = [];

    const termsOfUse = await this.termVersionRepository.findLatestByType(
      TermType.TERMS_OF_USE,
    );
    if (termsOfUse && termsOfUse.isActive) {
      const latestAcceptance =
        await this.termAcceptanceRepository.findLatestAcceptanceByUserAndType(
          userId,
          TermType.TERMS_OF_USE,
        );

      if (
        !latestAcceptance ||
        latestAcceptance.termVersionId !== (termsOfUse as any).id
      ) {
        missing.push({
          id: termsOfUse.id || '',
          type: TermType.TERMS_OF_USE,
          version: termsOfUse.version,
          s3Url: termsOfUse.s3Url,
        });
      }
    }

    const privacyPolicy = await this.termVersionRepository.findLatestByType(
      TermType.PRIVACY_POLICY,
    );
    if (privacyPolicy && privacyPolicy.isActive) {
      const latestAcceptance =
        await this.termAcceptanceRepository.findLatestAcceptanceByUserAndType(
          userId,
          TermType.PRIVACY_POLICY,
        );

      if (
        !latestAcceptance ||
        latestAcceptance.termVersionId !== (privacyPolicy as any).id
      ) {
        missing.push({
          id: privacyPolicy.id || '',
          type: TermType.PRIVACY_POLICY,
          version: privacyPolicy.version,
          s3Url: privacyPolicy.s3Url || '',
        });
      }
    }

    return missing;
  }
}
