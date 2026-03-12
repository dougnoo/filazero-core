import { TermType } from '../../../../database/entities/term-version.entity';

export interface ITermAcceptanceRepository {
  hasAcceptedVersion(userId: string, termVersionId: string): Promise<boolean>;
  findLatestAcceptanceByUserAndType(
    userId: string,
    type: TermType,
  ): Promise<{ termVersionId: string } | null>;
}

export const TERM_ACCEPTANCE_REPOSITORY_TOKEN =
  'TERM_ACCEPTANCE_REPOSITORY_TOKEN';
