import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { NewPasswordRequiredError } from '../../domain/errors/new-password-required.error';

@Catch(NewPasswordRequiredError)
export class NewPasswordRequiredFilter implements ExceptionFilter {
  catch(exception: NewPasswordRequiredError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.PRECONDITION_REQUIRED).json({
      statusCode: HttpStatus.PRECONDITION_REQUIRED,
      message: 'New password required',
      challengeName: 'NEW_PASSWORD_REQUIRED',
      session: exception.session,
      email: exception.email,
    });
  }
}
