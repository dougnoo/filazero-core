import { TermType } from '../../../../database/entities/term-version.entity';

export interface TermVersionData {
  id?: string;
  type: TermType;
  version: string;
  s3Key: string;
  s3Url: string;
  isActive: boolean;
  effectiveDate?: Date;
  changeDescription?: string;
  uploadedBy?: string;
  createdAt?: Date;
}

export interface ITermVersionRepository {
  findByTypeAndVersion(
    type: TermType,
    version: string,
  ): Promise<TermVersionData | null>;
  findLatestByType(type: TermType): Promise<TermVersionData | null>;
  findAllByType(type: TermType): Promise<(TermVersionData & { id: string })[]>;
  findById(id: string): Promise<(TermVersionData & { id: string }) | null>;
  save(data: TermVersionData): Promise<TermVersionData & { id: string }>;
  deactivateAllByType(type: TermType): Promise<void>;
}

export const TERM_VERSION_REPOSITORY_TOKEN = 'TERM_VERSION_REPOSITORY_TOKEN';
