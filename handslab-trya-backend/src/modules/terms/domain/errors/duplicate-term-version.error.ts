import { ConflictException } from '@nestjs/common';

export class DuplicateTermVersionError extends ConflictException {
  constructor(version: string, _type: string) {
    super({
      statusCode: 409,
      message: `Já existe um termo com a versão "${version}". Por favor, utilize uma versão diferente.`,
      error: 'DUPLICATE_TERM_VERSION',
    });
  }
}
