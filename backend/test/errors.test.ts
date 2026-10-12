import assert from 'node:assert/strict';
import test from 'node:test';
import { AppError, classifyError, createRequestId, ERROR_CODES, toErrorResponse } from '../src/utils/errors';

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
  assert.equal(error.code, ERROR_CODES.DATABASE_ERROR);
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
