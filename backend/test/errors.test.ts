import assert from 'node:assert/strict';
import test from 'node:test';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../src/config/prisma';
import { login } from '../src/controllers/authController';
import { AppError, classifyError, createRequestId, ERROR_CODES, installErrorHandler, sanitizeErrorText, toErrorResponse, withErrorContext } from '../src/utils/errors';
import { sendInternalError } from '../src/utils/httpErrors';

type CapturedFailure = {
  response: unknown;
  logs: Record<string, unknown>[];
};

function captureFailure(error: unknown, requestId = 'request-42'): CapturedFailure {
  let handler: ((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => unknown) | undefined;
  const logs: Record<string, unknown>[] = [];
  const server = {
    setErrorHandler(value: (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => unknown) {
      handler = value;
    },
    log: {
      error(data: unknown) {
        if (typeof data === 'object' && data !== null) logs.push(data as Record<string, unknown>);
      }
    }
  };
  installErrorHandler(server);
  let response: unknown;
  const reply = {
    status(statusCode: number) {
      return {
        send(payload: unknown) {
          response = { statusCode, payload };
          return response;
        }
      };
    }
  };
  handler?.(error as FastifyError, {
    id: requestId,
    method: 'POST',
    url: '/api/auth/login',
    routeOptions: { url: '/api/auth/login' }
  } as FastifyRequest, reply as FastifyReply);
  return { response, logs };
}

type UserUpsertMock = (...args: never[]) => Promise<unknown>;

function replaceUserUpsert(mock: UserUpsertMock): () => void {
  const original = prisma.user.upsert;
  Object.defineProperty(prisma.user, 'upsert', { configurable: true, value: mock });
  return () => Object.defineProperty(prisma.user, 'upsert', { configurable: true, value: original });
}

test('error responses have a stable safe envelope and request id', () => {
  const result = toErrorResponse(new AppError(ERROR_CODES.DATABASE_ERROR, 'The request could not be completed.', 503), 'req-123');
  assert.deepEqual(result, {
    success: false,
    error: {
      code: 'DATABASE_ERROR',
      message: 'The request could not be completed.',
      requestId: 'req-123',
      retryable: true
    }
  });
  assert.equal(JSON.stringify(result).includes('stack'), false);
});

test('database failures are classified without exposing driver details', () => {
  const error = classifyError({ code: 'P1001', message: 'postgres://user:password@host/db' });
  assert.equal(error.code, ERROR_CODES.DATABASE_UNAVAILABLE);
  assert.equal(error.statusCode, 503);
  assert.equal(error.message.includes('postgres'), false);
});

test('validation, auth, and unknown failures are classified safely', () => {
  assert.equal(classifyError({ validation: [] }).statusCode, 400);
  assert.equal(classifyError({ statusCode: 401, name: 'UnauthorizedError' }).code, ERROR_CODES.AUTHENTICATION_ERROR);
  assert.equal(classifyError(new Error('secret token and password')).code, ERROR_CODES.INTERNAL_ERROR);
  assert.equal(createRequestId('valid-request:1'), 'valid-request:1');
  assert.notEqual(createRequestId('contains spaces'), 'contains spaces');
});

test('database, protocol, JWT, timeout, and proxy-boundary mappings remain stable', () => {
  const cases = [
    [{ code: 'P2002' }, ERROR_CODES.CONFLICT, 409],
    [{ code: 'P2003' }, ERROR_CODES.CONFLICT, 409],
    [{ code: 'P2025' }, ERROR_CODES.NOT_FOUND, 404],
    [{ code: 'P1001' }, ERROR_CODES.DATABASE_UNAVAILABLE, 503],
    [{ code: '28P01' }, ERROR_CODES.DATABASE_SCHEMA_ERROR, 500],
    [{ code: '42P01' }, ERROR_CODES.DATABASE_SCHEMA_ERROR, 500],
    [{ code: 'P2024' }, ERROR_CODES.DATABASE_UNAVAILABLE, 503],
    [{ code: '57014' }, ERROR_CODES.REQUEST_TIMEOUT, 504],
    [{ code: 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED', statusCode: 401 }, ERROR_CODES.AUTHENTICATION_ERROR, 401],
    [{ code: 'FST_ERR_CTP_BODY_TOO_LARGE' }, ERROR_CODES.VALIDATION_ERROR, 413],
    [{ code: 'FST_ERR_ROUTE_NOT_FOUND', statusCode: 404 }, ERROR_CODES.NOT_FOUND, 404],
    [{ statusCode: 429 }, ERROR_CODES.RATE_LIMITED, 429]
  ] as const;

  for (const [input, code, status] of cases) {
    const result = classifyError(input);
    assert.equal(result.code, code);
    assert.equal(result.statusCode, status);
  }
});

test('context preserves operation, stage, and original cause without public leakage', () => {
  const original = Object.assign(new Error('password=super-secret postgres://user:pass@db/app'), { code: 'P1001' });
  const contextual = withErrorContext(original, { operation: 'auth.user_upsert', stage: 'database_query' });
  const response = toErrorResponse(contextual, 'request-42');

  assert.equal(response.error.code, ERROR_CODES.DATABASE_UNAVAILABLE);
  assert.equal(response.error.operation, 'auth.user_upsert');
  assert.equal(response.error.stage, 'database_query');
  assert.equal(JSON.stringify(response).includes('super-secret'), false);
  assert.equal(sanitizeErrorText(original.message)?.includes('super-secret'), false);
  assert.equal((contextual.cause as Error).message, original.message);
});

test('request ids reject control characters and remain distinct when generated', () => {
  assert.notEqual(createRequestId('bad\nrequest'), 'bad\nrequest');
  assert.notEqual(createRequestId(), createRequestId());
});

test('login Prisma failure preserves the upsert stage, cause, request id, safe response, and redacted log', async () => {
  process.env.ADMIN_USERNAME = 'diagnostic-admin';
  process.env.ADMIN_PASSWORD = 'diagnostic-password';
  const restoreUpsert = replaceUserUpsert(async () => {
    throw Object.assign(new Error('postgresql://db-user:db-password@db.internal/jansetu password=db-password'), { code: 'P1001' });
  });
  // prisma.user.upsert = (async () => {
  //   throw Object.assign(new Error('postgresql://adiryaboxi:123esaqw@db.internal/jansetu password=123esaqw'), { code: 'P1001' });
  // }) as typeof prisma.user.upsert;

  try {
    const request = {
      id: 'login-db-request',
      body: { role: 'admin', identifier: 'diagnostic-admin', password: 'diagnostic-password' },
      log: { info() {} }
    };
    const reply = { jwtSign: async () => 'unused-token', send() {} };
    let thrown: unknown;
    try {
      await login(request as any, reply as any);
      assert.fail('login should reject when Prisma is unavailable');
    } catch (error) {
      thrown = error;
    }
    const captured = captureFailure(thrown, request.id);
    const result = captured.response as { statusCode: number; payload: any };

    assert.equal(result.statusCode, 503);
    assert.equal(result.payload.error.code, ERROR_CODES.DATABASE_UNAVAILABLE);
    assert.equal(result.payload.error.requestId, request.id);
    assert.equal(result.payload.error.operation, 'auth.user_upsert');
    assert.equal(result.payload.error.stage, 'user_upsert');
    assert.equal(result.payload.error.message, 'The request could not be completed.');
    assert.equal(captured.logs[0].requestId, request.id);
    assert.equal(captured.logs[0].operation, 'auth.user_upsert');
    assert.equal(captured.logs[0].causeCode, 'P1001');
    assert.equal(String(captured.logs[0].causeMessage).includes('db-password'), false);
    assert.equal(String(captured.logs[0].causeMessage).includes('[redacted]'), true);
  } finally {
    restoreUpsert();
  }
});

test('login JWT signing failure preserves the signing stage and never returns a success payload', async () => {
  process.env.ADMIN_USERNAME = 'diagnostic-admin';
  process.env.ADMIN_PASSWORD = 'diagnostic-password';
  const restoreUpsert = replaceUserUpsert(async () => ({
    id: 'env_admin_id',
    userCode: 'diagnostic-admin',
    role: 'admin',
    fullName: 'Administrator'
  }));

  try {
    const request = {
      id: 'login-jwt-request',
      body: { role: 'admin', identifier: 'diagnostic-admin', password: 'diagnostic-password' },
      log: { info() {} }
    };
    const reply = {
      jwtSign: async () => {
        throw Object.assign(new Error('JWT signing key unavailable'), { code: 'JWT_SIGN_ERROR' });
      },
      send() {
        throw new Error('send must not be reached');
      }
    };
    let thrown: unknown;
    try {
      await login(request as any, reply as any);
      assert.fail('login should reject when JWT signing fails');
    } catch (error) {
      thrown = error;
    }
    const captured = captureFailure(thrown, request.id);
    const result = captured.response as { statusCode: number; payload: any };

    assert.equal(result.statusCode, 500);
    assert.equal(result.payload.success, false);
    assert.equal(result.payload.error.code, ERROR_CODES.INTERNAL_ERROR);
    assert.equal(result.payload.error.requestId, request.id);
    assert.equal(result.payload.error.operation, 'auth.jwt_sign');
    assert.equal(result.payload.error.stage, 'jwt_sign');
    assert.equal(captured.logs[0].requestId, request.id);
    assert.equal(captured.logs[0].operation, 'auth.jwt_sign');
    assert.equal(captured.logs[0].causeCode, 'JWT_SIGN_ERROR');
    assert.equal(result.payload.token, undefined);
  } finally {
    restoreUpsert();
  }
});

test('shared controller error bridge preserves operation and original database cause', () => {
  const original = Object.assign(new Error('postgresql://db-user:db-password@db.internal/jansetu'), { code: 'P2024' });
  assert.throws(
    () => sendInternalError({} as any, {} as any, original, 'households.query'),
    (error: any) => {
      assert.equal(error.code, ERROR_CODES.DATABASE_UNAVAILABLE);
      assert.equal(error.metadata.operation, 'households.query');
      assert.equal(error.metadata.stage, 'controller');
      assert.equal(error.cause, original);
      return true;
    }
  );

  const captured = captureFailure(withErrorContext(original, { operation: 'households.query', stage: 'controller' }), 'controller-request');
  const result = captured.response as { statusCode: number; payload: any };
  assert.equal(result.statusCode, 503);
  assert.equal(result.payload.error.requestId, 'controller-request');
  assert.equal(result.payload.error.operation, 'households.query');
  assert.equal(captured.logs[0].causeCode, 'P2024');
  assert.equal(String(captured.logs[0].causeMessage).includes('db-password'), false);
});
