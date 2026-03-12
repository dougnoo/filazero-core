import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ITermVersionRepository } from '../../../domain/repositories/term-version.repository.interface';
import { TERM_VERSION_REPOSITORY_TOKEN } from '../../../domain/repositories/term-version.repository.interface';
import { TermType } from '../../../../../database/entities/term-version.entity';
import { GetLatestTermResponseDto } from './get-latest-term-response.dto';

@Injectable()
export class GetLatestTermUseCase {
  constructor(
    @Inject(TERM_VERSION_REPOSITORY_TOKEN)
    private readonly termVersionRepository: ITermVersionRepository,
  ) {}

  async execute(): Promise<GetLatestTermResponseDto[]> {
    const termsOfUse = await this.termVersionRepository.findLatestByType(
      TermType.TERMS_OF_USE,
    );
    const privacyPolicy = await this.termVersionRepository.findLatestByType(
      TermType.PRIVACY_POLICY,
    );

    const result: GetLatestTermResponseDto[] = [];

    if (termsOfUse && termsOfUse.isActive) {
      result.push({
        id: termsOfUse.id,
        type: termsOfUse.type,
        version: termsOfUse.version,
        s3Url: termsOfUse.s3Url,
        isActive: termsOfUse.isActive,
        createdAt: termsOfUse.createdAt!,
      });
    }

    if (privacyPolicy && privacyPolicy.isActive) {
      result.push({
        id: privacyPolicy.id,
        type: privacyPolicy.type,
        version: privacyPolicy.version,
        s3Url: privacyPolicy.s3Url,
        isActive: privacyPolicy.isActive,
        createdAt: privacyPolicy.createdAt!,
      });
    }

    return result;
  }
}
