import { TermType } from '../../../../../database/entities/term-version.entity';

export class MissingTermAcceptanceDto {
  id: string;
  type: TermType;
  version: string;
  s3Url: string;
}
