import { BadRequestException } from '@nestjs/common';

export class FirstLoginCPFError extends BadRequestException {
  constructor() {
    super({
      statusCode: 400,
      message: 'Primeiro login com CPF.',
      error: 'FIRST_LOGIN_CPF',
    });
  }
}
