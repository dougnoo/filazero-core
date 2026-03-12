import { BadRequestException } from '@nestjs/common';

export class NewPasswordRequiredError extends BadRequestException {
  constructor(
    public readonly session: string,
    public readonly requiredAttributes: string[] = [],
  ) {
    super({
      statusCode: 400,
      message: 'Nova senha é necessária. Este é o primeiro login do usuário.',
      error: 'NEW_PASSWORD_REQUIRED',
      session,
      requiredAttributes,
    });
  }
}
