import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticationError } from '../../../modules/auth/domain/errors/authentication.error';
import { UserNotConfirmedError } from '../../../modules/auth/domain/errors/user-not-confirmed.error';
import { UserAlreadyExistsError } from '../../../modules/auth/domain/errors/user-already-exists.error';
import { UserNotFoundError } from '../../../modules/auth/domain/errors/user-not-found.error';
import { InvalidVerificationCodeError } from '../../../modules/auth/domain/errors/invalid-verification-code.error';
import { CodeExpiredError } from '../../../modules/auth/domain/errors/code-expired.error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
    }
    // Handle domain exceptions
    else if (exception instanceof AuthenticationError) {
      status = HttpStatus.UNAUTHORIZED;
      message = exception.message;
    } else if (exception instanceof UserNotConfirmedError) {
      status = HttpStatus.FORBIDDEN;
      message = exception.message;
    } else if (exception instanceof UserAlreadyExistsError) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
    } else if (exception instanceof UserNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    } else if (exception instanceof InvalidVerificationCodeError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof CodeExpiredError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    }
    // Handle generic errors
    else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Log error details
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${message}`,
        exception instanceof Error ? exception.stack : exception,
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} - ${message}`);
    }

    // Add CORS headers to error responses
    // This ensures CORS headers are present even when errors occur
    // This is critical because browsers block error responses without CORS headers
    const origin = request.headers.origin;
    if (origin) {
      // Check if origin should be allowed (same logic as CORS middleware in main.ts)
      const nodeEnv = process.env.NODE_ENV || 'development';
      const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
      
      // Allow requests with no origin (like mobile apps or curl requests)
      // In development, allow all localhost origins
      // In non-production, allow all *.trya.ai subdomains
      // Otherwise, check against CORS_ORIGIN env var
      const shouldAllowOrigin =
        (nodeEnv === 'development' && origin.startsWith('http://localhost')) ||
        (nodeEnv !== 'production' && origin.endsWith('.trya.ai')) ||
        corsOrigin.split(',').map((o: string) => o.trim()).includes(origin);

      if (shouldAllowOrigin) {
        response.setHeader('Access-Control-Allow-Origin', origin);
        response.setHeader('Access-Control-Allow-Credentials', 'true');
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
        response.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
      }
    }

    response.status(status).json(errorResponse);
  }
}
