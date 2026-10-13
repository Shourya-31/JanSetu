import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/prisma';
import { AppError, ERROR_CODES, withErrorContext } from '../utils/errors';
import { verifyPassword } from '../utils/password';

export async function login(req: FastifyRequest, reply: FastifyReply) {
  
  const body = req.body as {
    role: 'admin' | 'surveyor';
    identifier: string;
    password: string;
  };
  const role = body.role;
  const identifier = body.identifier.trim();
  const password = body.password.trim();


  try {
    req.log.info({ event: 'auth.stage', requestId: req.id, operation: 'auth.request_validation', stage: 'request_validation' }, 'Authentication request accepted');
    let isValid = false;
    let fallbackId = '';
    let fullName = '';
    let user;

    if (role === 'admin') {
      const envUser = process.env.ADMIN_USERNAME;
      const envPass = process.env.ADMIN_PASSWORD;
      if (!envUser || !envPass) {
        throw new AppError(ERROR_CODES.INTERNAL_ERROR, 'Login is temporarily unavailable.', 503, { operation: 'auth.login.configuration' }, { retryable: true });
      }
      if (identifier === envUser && password === envPass) {
        isValid = true;
        fallbackId = 'env_admin_id';
        fullName = 'Administrator';
      }
    } else if (role === 'surveyor') {
      user = await prisma.user.findUnique({
        where: { userCode: identifier }
      });
      if (user?.role === 'surveyor' && await verifyPassword(password, user.passwordHash)) {
        isValid = true;
      }
    }

    if (!isValid) {
      throw new AppError(ERROR_CODES.AUTHENTICATION_ERROR, 'Invalid credentials.', 401, undefined, { retryable: false });
    }
    req.log.info({ event: 'auth.stage', requestId: req.id, operation: 'auth.credentials_check', stage: 'credentials_check' }, 'Authentication credentials accepted');

    if (role === 'admin') {
      req.log.info({ event: 'auth.stage', requestId: req.id, operation: 'auth.user_upsert', stage: 'user_upsert' }, 'Provisioning authenticated user');
      try {
        user = await prisma.user.upsert({
          where: { userCode: identifier },
          update: { role, fullName, passwordHash: 'env_managed' },
          create: {
            id: fallbackId,
            userCode: identifier,
            role,
            fullName,
            passwordHash: 'env_managed',
          }
        });
      } catch (err) {
        throw withErrorContext(err, { operation: 'auth.user_upsert', stage: 'user_upsert' });
      }
    }

    req.log.info({ event: 'auth.stage', requestId: req.id, operation: 'auth.jwt_sign', stage: 'jwt_sign' }, 'Signing authentication token');
    let token: string;
    try {
      token = await reply.jwtSign({
        id: user.id,
        userCode: user.userCode,
        role: user.role,
        fullName: user.fullName
      }, { expiresIn: '8h' });
    } catch (err) {
      throw withErrorContext(err, { operation: 'auth.jwt_sign', stage: 'jwt_sign' });
    }

    reply.setCookie('jansetu_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === undefined
        ? process.env.NODE_ENV === 'production'
        : process.env.COOKIE_SECURE === 'true',
      maxAge: 8 * 60 * 60,
      path: '/'
    });

    req.log.info({ event: 'auth.stage', requestId: req.id, operation: 'auth.response', stage: 'response' }, 'Authentication response ready');
    return reply.send({
      success: true,
      token,
      user: {
        id: user.id,
        userCode: user.userCode,
        role: user.role,
        fullName: user.fullName
      }
    });
  } catch (err) {
    throw withErrorContext(err, {
      operation: err instanceof AppError && err.metadata?.operation ? String(err.metadata.operation) : 'auth.login',
      stage: err instanceof AppError && err.metadata?.stage ? String(err.metadata.stage) : 'auth.failure'
    });
  }
}

export async function getCurrentUser(req: FastifyRequest, reply: FastifyReply) {
  await req.jwtVerify();
  const claims = req.user as { id?: string; userCode?: string; role?: 'admin' | 'surveyor'; fullName?: string };
  if (!claims.id || !claims.userCode || !claims.role) {
    return reply.code(401).send({ success: false, error: { message: 'Authentication is required.' } });
  }
  return reply.send({
    success: true,
    user: {
      id: claims.id,
      userCode: claims.userCode,
      role: claims.role,
      fullName: claims.fullName || ''
    }
  });
}

export async function logout(_req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie('jansetu_token', { path: '/' });
  return reply.send({ success: true });
}
