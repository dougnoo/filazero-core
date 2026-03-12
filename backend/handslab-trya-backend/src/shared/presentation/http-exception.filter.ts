import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError as AuthDomainError } from '../../modules/auth/domain/errors/domain.error';
import { InvalidCredentialsError } from '../../modules/auth/domain/errors/invalid-credentials.error';
import { UserNotConfirmedError } from '../../modules/auth/domain/errors/user-not-confirmed.error';
import { UserNotFoundError } from '../domain/errors/user-not-found.error';
import { OnboardAlreadyCompletedError } from '../domain/errors/onboard-already-completed.error';
import { AuthenticationError } from '../../modules/auth/domain/errors/authentication.error';
import { NewPasswordRequiredError } from '../../modules/auth/domain/errors/new-password-required.error';
import { ForgotPasswordError } from '../../modules/auth/domain/errors/forgot-password.error';
import { ResetPasswordError } from '../../modules/auth/domain/errors/reset-password.error';
import { InvalidVerificationCodeError } from '../../modules/auth/domain/errors/invalid-verification-code.error';
import { TenantMismatchError } from '../../modules/auth/domain/errors/tenant-mismatch.error';
import { NotImplementedError } from '../../modules/auth/domain/errors/not-implemented.error';
import { InvalidAuthorizationCodeError } from '../../modules/auth/domain/errors/invalid-authorization-code.error';
import { InvalidRepositoryResponseError } from '../../modules/auth/domain/errors/invalid-repository-response.error';
import { UserAlreadyExistsError } from '../domain/errors/user-already-exists.error';
import { CpfAlreadyExistsError } from '../../modules/user-management/domain/errors/cpf-already-exists.error';
import { DatabaseSaveFailedError } from '../../modules/user-management/domain/errors/database-save-failed.error';
import { UserCreationError } from '../../modules/user-management/domain/errors/user-creation.error';
import { UserUpdateError } from '../../modules/user-management/domain/errors/user-update.error';
import { UserDeletionError } from '../../modules/user-management/domain/errors/user-deletion.error';
import { RoleAssignmentError } from '../../modules/user-management/domain/errors/role-assignment.error';
import { ThemeNotFoundError } from '../../modules/public-config/domain/errors/theme-not-found.error';
import { BucketNotConfiguredError } from '../../modules/public-config/domain/errors/bucket-not-configured.error';
import { ConfigFetchFailedError } from '../../modules/public-config/domain/errors/config-fetch-failed.error';
import { ConfigSaveFailedError } from '../../modules/public-config/domain/errors/config-save-failed.error';
import { ConfigDeleteFailedError } from '../../modules/public-config/domain/errors/config-delete-failed.error';
import { TenantAlreadyExistsError } from '../../modules/tenant/domain/errors/tenant-already-exists.error';
import { TenantNotFoundError } from '../../modules/tenant/domain/errors/tenant-not-found.error';
import { BeneficiaryAlreadyDeactivatedError } from '../../modules/user-management/domain/errors/beneficiary-already-deactivated.error';
import { TenantIdRequiredError } from '../../modules/user-management/domain/errors/tenant-id-required.error';
import { InsufficientPermissionsError } from '../../modules/user-management/domain/errors/insufficient-permissions.error';
import { CannotDeactivateSelfError } from '../../modules/user-management/domain/errors/cannot-deactivate-self.error';
import { DuplicateTermVersionError } from '../../modules/terms/domain/errors/duplicate-term-version.error';

import {
  ErrorResponse,
  ValidationErrorDetail,
} from './interfaces/error-response.interface';
import { TermsNotAcceptedError } from 'src/modules/auth/domain/errors/terms-not-accepted.error';
import { InvalidTokenStepError } from '../../modules/auth/domain/errors/invalid-token-step.error';
import { InvalidPhoneFormatError } from '../../modules/auth/domain/errors/invalid-phone-format.error';
import { BirthdateMismatchError } from 'src/modules/auth/domain/errors/birthdate-mismatch.error';
import { CpfNotFoundError } from '../../modules/auth/domain/errors/cpf-not-found.error';

/**
 * Filtro global de exceções
 * Trata todas as exceções da aplicação e padroniza as respostas de erro
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    // Log do erro (com path e method)
    this.logError(errorResponse, exception, request);

    // Enviar resposta (sem path e method)
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Constrói a resposta de erro padronizada
   */
  private buildErrorResponse(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    const baseResponse: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    };

    // NewPasswordRequiredError - Tratamento especial com campos extras
    if (exception instanceof NewPasswordRequiredError) {
      return this.handleNewPasswordRequiredError(exception, baseResponse);
    }

    // BadRequestException - Pode conter erros de validação
    if (exception instanceof BadRequestException) {
      return this.handleBadRequestException(exception, baseResponse);
    }

    // InvalidCredentialsError
    if (exception instanceof InvalidCredentialsError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'INVALID_CREDENTIALS',
        message: exception.message,
      };
    }

    // UserNotConfirmedError
    if (exception instanceof UserNotConfirmedError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.FORBIDDEN,
        error: 'USER_NOT_CONFIRMED',
        message: exception.message,
      };
    }

    // InvalidTokenStepError
    if (exception instanceof InvalidTokenStepError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'INVALID_TOKEN_STEP',
        message: exception.message,
      };
    }

    // InvalidPhoneFormatError
    if (exception instanceof InvalidPhoneFormatError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'INVALID_PHONE_FORMAT',
        message: exception.message,
      };
    }

    // BirthdateMismatchError
    if (exception instanceof BirthdateMismatchError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'BIRTHDATE_MISMATCH',
        message: exception.message,
      };
    }

    // UserNotFoundError
    if (exception instanceof UserNotFoundError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.NOT_FOUND,
        error: 'USER_NOT_FOUND',
        message: exception.message,
      };
    }

    // OnboardAlreadyCompletedError
    if (exception instanceof OnboardAlreadyCompletedError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.CONFLICT,
        error: 'ONBOARD_ALREADY_COMPLETED',
        message: exception.message,
      };
    }

    // ForgotPasswordError
    if (exception instanceof ForgotPasswordError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'FORGOT_PASSWORD_ERROR',
        message: exception.message,
      };
    }

    // ResetPasswordError
    if (exception instanceof ResetPasswordError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'RESET_PASSWORD_ERROR',
        message: exception.message,
      };
    }

    // InvalidVerificationCodeError
    if (exception instanceof InvalidVerificationCodeError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'INVALID_VERIFICATION_CODE',
        message: exception.message,
      };
    }

    // AuthenticationError
    if (exception instanceof AuthenticationError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'AUTHENTICATION_ERROR',
        message: exception.message,
      };
    }

    // TenantMismatchError
    if (exception instanceof TenantMismatchError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'TENANT_MISMATCH',
        message: exception.message,
      };
    }

    // NotImplementedError
    if (exception instanceof NotImplementedError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.NOT_IMPLEMENTED,
        error: 'NOT_IMPLEMENTED',
        message: exception.message,
      };
    }

    // InvalidAuthorizationCodeError
    if (exception instanceof InvalidAuthorizationCodeError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'INVALID_AUTHORIZATION_CODE',
        message: exception.message,
      };
    }

    // InvalidRepositoryResponseError
    if (exception instanceof InvalidRepositoryResponseError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'INVALID_REPOSITORY_RESPONSE',
        message: exception.message,
      };
    }

    // UserAlreadyExistsError
    if (exception instanceof UserAlreadyExistsError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.CONFLICT,
        error: 'USER_ALREADY_EXISTS',
        message: (exception as Error).message,
      };
    }

    // CpfAlreadyExistsError
    if (exception instanceof CpfAlreadyExistsError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.CONFLICT,
        error: 'CPF_ALREADY_EXISTS',
        message: (exception as Error).message,
      };
    }

    // CpfNotFoundError
    if (exception instanceof CpfNotFoundError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.NOT_FOUND,
        error: 'CPF_NOT_FOUND_ERROR',
        message: exception.message,
      };
    }

    // DatabaseSaveFailedError
    if (exception instanceof DatabaseSaveFailedError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'DATABASE_SAVE_FAILED',
        message: (exception as Error).message,
      };
    }

    // UserCreationError
    if (exception instanceof UserCreationError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'USER_CREATION_ERROR',
        message: (exception as Error).message,
      };
    }

    // UserUpdateError
    if (exception instanceof UserUpdateError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'USER_UPDATE_ERROR',
        message: (exception as Error).message,
      };
    }

    // UserDeletionError
    if (exception instanceof UserDeletionError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'USER_DELETION_ERROR',
        message: (exception as Error).message,
      };
    }

    // RoleAssignmentError
    if (exception instanceof RoleAssignmentError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'ROLE_ASSIGNMENT_ERROR',
        message: (exception as Error).message,
      };
    }

    // ThemeNotFoundError
    if (exception instanceof ThemeNotFoundError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.NOT_FOUND,
        error: 'THEME_NOT_FOUND',
        message: exception.message,
      };
    }

    // BucketNotConfiguredError
    if (exception instanceof BucketNotConfiguredError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'BUCKET_NOT_CONFIGURED',
        message: exception.message,
      };
    }

    // ConfigFetchFailedError
    if (exception instanceof ConfigFetchFailedError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'CONFIG_FETCH_FAILED',
        message: exception.message,
      };
    }

    // ConfigSaveFailedError
    if (exception instanceof ConfigSaveFailedError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'CONFIG_SAVE_FAILED',
        message: exception.message,
      };
    }

    // ConfigDeleteFailedError
    if (exception instanceof ConfigDeleteFailedError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'CONFIG_DELETE_FAILED',
        message: exception.message,
      };
    }

    // TenantAlreadyExistsError
    if (exception instanceof TenantAlreadyExistsError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.CONFLICT,
        error: 'TENANT_ALREADY_EXISTS',
        message: exception.message,
      };
    }

    // TenantNotFoundError
    if (exception instanceof TenantNotFoundError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.NOT_FOUND,
        error: 'TENANT_NOT_FOUND',
        message: exception.message,
      };
    }

    // BeneficiaryAlreadyDeactivatedError
    if (exception instanceof BeneficiaryAlreadyDeactivatedError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.CONFLICT,
        error: 'BENEFICIARY_ALREADY_DEACTIVATED',
        message: exception.message,
      };
    }

    // TenantIdRequiredError
    if (exception instanceof TenantIdRequiredError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'TENANT_ID_REQUIRED',
        message: exception.message,
      };
    }

    // InsufficientPermissionsError
    if (exception instanceof InsufficientPermissionsError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.FORBIDDEN,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: exception.message,
      };
    }

    // CannotDeactivateSelfError
    if (exception instanceof CannotDeactivateSelfError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.FORBIDDEN,
        error: 'CANNOT_DEACTIVATE_SELF',
        message: exception.message,
      };
    }

    // TermsNotAcceptedError
    if (exception instanceof TermsNotAcceptedError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.FORBIDDEN,
        error: 'TERMS_NOT_ACCEPTED',
        message: exception.message,
        details: {
          missingTerms: exception.missingTerms,
        },
      };
    }

    // DuplicateTermVersionError
    if (exception instanceof DuplicateTermVersionError) {
      const exceptionResponse = exception.getResponse() as {
        statusCode: number;
        message: string;
        error: string;
      };
      return {
        ...baseResponse,
        statusCode: HttpStatus.CONFLICT,
        error: exceptionResponse.error || 'DUPLICATE_TERM_VERSION',
        message: exceptionResponse.message || exception.message,
      };
    }

    // Outros Domain Errors de Auth
    if (exception instanceof AuthDomainError) {
      return {
        ...baseResponse,
        statusCode: HttpStatus.BAD_REQUEST,
        error: this.convertToErrorCode(exception.name),
        message: exception.message,
      };
    }

    // HttpException genérica
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, baseResponse);
    }

    // Error genérico
    if (exception instanceof Error) {
      return {
        ...baseResponse,
        error: this.convertToErrorCode(exception.name),
        message: exception.message,
      };
    }

    // Exceção desconhecida
    return {
      ...baseResponse,
      message: 'Ocorreu um erro desconhecido',
    };
  }

  /**
   * Trata NewPasswordRequiredError com campos extras
   */
  private handleNewPasswordRequiredError(
    exception: NewPasswordRequiredError,
    baseResponse: ErrorResponse,
  ): ErrorResponse {
    const exceptionResponse = exception.getResponse() as any;

    return {
      ...baseResponse,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'NEW_PASSWORD_REQUIRED',
      message: exceptionResponse.message,
      details: {
        session: exceptionResponse.session,
        requiredAttributes: exceptionResponse.requiredAttributes || [],
      },
    };
  }

  /**
   * Trata BadRequestException (pode conter erros de validação do class-validator)
   */
  private handleBadRequestException(
    exception: BadRequestException,
    baseResponse: ErrorResponse,
  ): ErrorResponse {
    const exceptionResponse = exception.getResponse() as any;

    // Debug: Log da estrutura da exceção
    this.logger.debug('BadRequestException structure:', {
      message: exceptionResponse.message,
      error: exceptionResponse.error,
      isArray: Array.isArray(exceptionResponse.message),
      type: typeof exceptionResponse.message,
    });

    // Verificar se contém erros de validação
    if (Array.isArray(exceptionResponse.message)) {
      this.logger.debug('Validation errors array:', exceptionResponse.message);
      const validationErrors = this.parseValidationErrors(
        exceptionResponse.message,
      );

      return {
        ...baseResponse,
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'VALIDATION_ERROR',
        message: 'Erro de validação nos dados enviados',
        validationErrors,
        details: {
          totalErrors: validationErrors.length,
          fields: validationErrors.map((err) => err.field),
        },
      };
    }

    return {
      ...baseResponse,
      statusCode: HttpStatus.BAD_REQUEST,
      error: exceptionResponse.error || 'BAD_REQUEST',
      message: exceptionResponse.message || exception.message,
    };
  }

  /**
   * Trata HttpException genérica
   */
  private handleHttpException(
    exception: HttpException,
    baseResponse: ErrorResponse,
  ): ErrorResponse {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return {
        ...baseResponse,
        statusCode: status,
        error: this.getErrorCodeFromStatus(status),
        message: exceptionResponse,
      };
    }

    if (typeof exceptionResponse === 'object') {
      const response = exceptionResponse as any;
      return {
        ...baseResponse,
        statusCode: status,
        error: response.error || this.getErrorCodeFromStatus(status),
        message: response.message || exception.message,
        details: response.details,
      };
    }

    return {
      ...baseResponse,
      statusCode: status,
      error: this.getErrorCodeFromStatus(status),
      message: exception.message,
    };
  }

  /**
   * Parse erros de validação do class-validator
   */
  private parseValidationErrors(messages: any[]): ValidationErrorDetail[] {
    this.logger.debug('Parsing validation errors:', messages);

    // Se as mensagens são strings simples, tentar extrair informações do DTO
    if (messages.every((msg) => typeof msg === 'string')) {
      this.logger.debug(
        'Messages are strings, trying to extract field information',
      );

      // Mapear mensagens conhecidas para campos
      const fieldMapping: Record<string, string> = {
        'Email é obrigatório': 'email',
        'Email deve ter um formato válido': 'email',
        'Senha deve ser uma string': 'password',
        'Senha deve ter pelo menos 8 caracteres': 'password',
        'Código de verificação é obrigatório': 'verificationCode',
        'Nova senha é obrigatória': 'newPassword',
      };

      const errors: ValidationErrorDetail[] = [];
      const processedFields = new Set<string>();

      messages.forEach((message: string) => {
        // Tentar extrair automaticamente o campo de mensagens padrão do class-validator
        // Exemplos: "name must be a string", "name must be longer than or equal to 3 characters"
        //           "each value in tags must be a string", "user.name must be an email"
        let autoField = 'unknown';
        const directMatch = message.match(/^(\w[\w.]*)\s+must\s+/i);
        const eachInMatch = message.match(
          /^each value in\s+(\w[\w.]*)\s+must\s+/i,
        );
        if (directMatch && directMatch[1]) {
          autoField = directMatch[1];
        } else if (eachInMatch && eachInMatch[1]) {
          autoField = eachInMatch[1];
        }

        const field = fieldMapping[message] || autoField;

        if (!processedFields.has(field)) {
          errors.push({
            field,
            constraints: [message],
          });
          processedFields.add(field);
        } else {
          // Se o campo já existe, adicionar a constraint
          const existingError = errors.find((err) => err.field === field);
          if (existingError) {
            existingError.constraints.push(message);
          }
        }
      });

      this.logger.debug('Processed string messages to errors:', errors);
      return errors;
    }

    // Processamento original para objetos com property
    const errors = messages
      .filter((msg) => {
        const isValid = typeof msg === 'object' && msg.property;
        if (!isValid) {
          this.logger.debug('Skipping invalid message:', msg);
        }
        return isValid;
      })
      .map((msg) => {
        this.logger.debug('Processing validation message:', msg);

        const constraints = msg.constraints
          ? Object.values(msg.constraints)
          : [msg.message || 'Erro de validação'];

        const result = {
          field: msg.property,
          constraints,
        };

        this.logger.debug('Processed validation error:', result);
        return result;
      });

    this.logger.debug('Final validation errors:', errors);
    return errors;
  }

  /**
   * Converte nome de classe para código de erro
   * Ex: "InvalidCredentialsError" -> "INVALID_CREDENTIALS_ERROR"
   */
  private convertToErrorCode(name: string): string {
    return name
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .replace(/^_/, '');
  }

  /**
   * Retorna código de erro baseado no status HTTP
   */
  private getErrorCodeFromStatus(status: number): string {
    const statusMessages: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
    };

    return statusMessages[status] || 'UNKNOWN_ERROR';
  }

  /**
   * Loga o erro de acordo com a severidade
   */
  private logError(
    errorResponse: ErrorResponse,
    exception: unknown,
    request: Request,
  ): void {
    const logMessage = `${request.method} ${request.url} - ${errorResponse.error}`;

    if (errorResponse.statusCode >= 500) {
      // Erros de servidor - log completo com stack trace
      this.logger.error(
        logMessage,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify({
              ...errorResponse,
              path: request.url,
              method: request.method,
            }),
      );
    } else if (errorResponse.statusCode >= 400) {
      // Erros de cliente - warning
      this.logger.warn(logMessage, {
        statusCode: errorResponse.statusCode,
        error: errorResponse.error,
        message: errorResponse.message,
        path: request.url,
        method: request.method,
      });
    }
  }
}
