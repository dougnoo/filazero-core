import { BadRequestException } from '@nestjs/common';

export class InvalidOtpError extends BadRequestException {
  constructor(message: string = 'Código OTP inválido ou expirado') {
    super({
      statusCode: 400,
      message,
      error: 'INVALID_OTP',
    });
  }
}
