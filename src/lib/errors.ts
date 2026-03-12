/**
 * Standardized Error Types — Matches trya-backend error codes.
 *
 * Every service function should throw one of these typed errors
 * so UI can react consistently (toast, redirect, retry).
 */

export enum ErrorCode {
  // Auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // WebSocket
  WS_CONNECTION_FAILED = 'WS_CONNECTION_FAILED',
  WS_MESSAGE_ERROR = 'WS_MESSAGE_ERROR',
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status?: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  get isAuth(): boolean {
    return [ErrorCode.UNAUTHORIZED, ErrorCode.FORBIDDEN, ErrorCode.SESSION_EXPIRED].includes(this.code);
  }

  get isRetryable(): boolean {
    return [ErrorCode.NETWORK_ERROR, ErrorCode.TIMEOUT, ErrorCode.SERVICE_UNAVAILABLE].includes(this.code);
  }
}

/** Map HTTP status to ErrorCode */
export function statusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 401: return ErrorCode.UNAUTHORIZED;
    case 403: return ErrorCode.FORBIDDEN;
    case 404: return ErrorCode.NOT_FOUND;
    case 409: return ErrorCode.CONFLICT;
    case 422: return ErrorCode.VALIDATION_ERROR;
    case 503: return ErrorCode.SERVICE_UNAVAILABLE;
    default: return status >= 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.VALIDATION_ERROR;
  }
}
