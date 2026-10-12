import { randomUUID } from 'node:crypto';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly statusCode = 500,
    readonly metadata?: Record<string, string | number | boolean>,
    options?: { cause?: unknown; retryable?: boolean }
  ) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'AppError';
    this.retryable = options?.retryable ?? statusCode >= 500;
  }

  readonly retryable: boolean;
}

export type ErrorResponse = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    requestId: string;
    retryable: boolean;
    details?: Record<string, unknown>;
  };
};

const incomingRequestId = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;

export function isValidRequestId(value: unknown): value is string {
  return typeof value === 'string' && incomingRequestId.test(value);
}

export function createRequestId(value?: unknown): string {
  return isValidRequestId(value) ? value : randomUUID();
}

function isPrismaError(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === code;
}

export function classifyError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (isPrismaError(error, 'P2002')) {
    return new AppError(ERROR_CODES.CONFLICT, 'The record already exists.', 409, undefined, { cause: error, retryable: false });
  }
  if (isPrismaError(error, 'P2025')) {
    return new AppError(ERROR_CODES.NOT_FOUND, 'The requested record was not found.', 404, undefined, { cause: error, retryable: false });
  }
  if (isPrismaError(error, 'P2003')) {
    return new AppError(ERROR_CODES.CONFLICT, 'The request conflicts with related records.', 409, undefined, { cause: error, retryable: false });
  }
  if (isPrismaError(error, 'P1001') || isPrismaError(error, 'P1002') || isPrismaError(error, 'P2024')) {
    return new AppError(ERROR_CODES.DATABASE_ERROR, 'The request could not be completed.', 503, undefined, { cause: error });
  }
  if (isPrismaError(error, 'P1010') || isPrismaError(error, 'P1011') || isPrismaError(error, 'P3006')) {
    return new AppError(ERROR_CODES.DATABASE_ERROR, 'The request could not be completed.', 500, undefined, { cause: error, retryable: false });
  }

  const candidate = error as { validation?: unknown; statusCode?: number; code?: string; name?: string } | null;
  if (candidate?.validation) {
    return new AppError(ERROR_CODES.VALIDATION_ERROR, 'The request contains invalid data.', 400, undefined, { cause: error, retryable: false });
  }
  if (candidate?.statusCode === 429) {
    return new AppError(ERROR_CODES.RATE_LIMITED, 'Too many requests. Please try again later.', 429, undefined, { cause: error });
  }
  if (candidate?.statusCode === 401 || candidate?.name === 'UnauthorizedError' || candidate?.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
    return new AppError(ERROR_CODES.AUTHENTICATION_ERROR, 'Authentication is required.', 401, undefined, { cause: error, retryable: false });
  }
  if (candidate?.statusCode === 403) {
    return new AppError(ERROR_CODES.AUTHORIZATION_ERROR, 'You are not authorized to perform this action.', 403, undefined, { cause: error, retryable: false });
  }

  return new AppError(ERROR_CODES.INTERNAL_ERROR, 'The request could not be completed.', 500, undefined, { cause: error });
}

export function toErrorResponse(error: AppError, requestId: string, includeDetails = false): ErrorResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      requestId,
      retryable: error.retryable,
      ...(includeDetails && error.metadata ? { details: error.metadata } : {})
    }
  };
}

export function installErrorHandler(server: { setErrorHandler: (handler: (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => unknown) => void; log: { error: (data: unknown, message?: string) => void } }): void {
  server.setErrorHandler((error, request, reply) => {
    const requestId = request.id;
    const classified = classifyError(error);
    const source = error as { name?: string; code?: string; message?: string };
    server.log.error({
      requestId,
      operation: `${request.method} ${request.routeOptions?.url || request.url}`,
      errorCode: classified.code,
      sourceType: source?.name || 'Error',
      sourceCode: source?.code,
      sourceMessage: process.env.NODE_ENV === 'production' ? undefined : source?.message
    }, 'Request failed');
    return reply.status(classified.statusCode).send(toErrorResponse(classified, requestId, process.env.NODE_ENV !== 'production'));
  });
}
