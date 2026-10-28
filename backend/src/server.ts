import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import compress from '@fastify/compress';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import cookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import prisma from './config/prisma';
import apiRoutes from './routes/api';
import { createRequestId, ERROR_CODES, installErrorHandler, toErrorResponse, AppError } from './utils/errors';
import { startStatisticalAnalysisRefreshWorker, stopStatisticalAnalysisRefreshWorker } from './services/statisticalAnalysisRefresh';

const server = Fastify({
  logger: process.env.NODE_ENV === 'production' ? { level: process.env.LOG_LEVEL || 'info' } : true,
  requestIdHeader: 'x-request-id',
  genReqId: (req) => createRequestId(req.headers['x-request-id']),
  connectionTimeout: Number(process.env.CONNECTION_TIMEOUT || 10000),
  keepAliveTimeout: Number(process.env.KEEP_ALIVE_TIMEOUT || 5000),
  requestTimeout: Number(process.env.REQUEST_TIMEOUT || 30000),
  bodyLimit: 10 * 1024 * 1024, // 10 MB payload limit
  pluginTimeout: 30000,
  ajv: {
    customOptions: {
      removeAdditional: false,
      coerceTypes: 'array',
      useDefaults: true,
      allErrors: true
    }
  }
});

let shuttingDown = false;
const requestStartedAt = new WeakMap<object, number>();

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, milliseconds);
    timer.unref();
  });
}



async function start() {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET is missing or invalid');
    }
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is missing');
    }
    if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
      throw new Error('CORS_ORIGIN is missing in production');
    }
    server.log.info({ operation: 'startup.configuration', jwtSecret: 'valid', databaseUrl: 'present', corsOrigin: process.env.CORS_ORIGIN ? 'present' : 'default' }, 'Startup configuration validated');

    // 1. Security Headers Plugin
    await server.register(helmet, {
      contentSecurityPolicy: false
    });

    await server.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
      }
    });

    await server.register(cookie);

    // 2. High-Speed Compression (Brotli + Gzip)
    await server.register(compress, {
      threshold: Number(process.env.COMPRESS_THRESHOLD || 1024),
      encodings: ['br', 'gzip', 'deflate']
    });

    // 3. Environment-Driven Rate Limiter
    await server.register(rateLimit, {
      max: Number(process.env.RATE_LIMIT_MAX || 1000),
      timeWindow: (process.env.RATE_LIMIT_WINDOW as string) || '1 minute',
      addHeaders: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true,
        'retry-after': true
      }
    });

    // 4. Dynamic CORS Plugin
    await server.register(cors, {
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
        : process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173'],
      credentials: true
    });

    // 5. JWT Authentication Plugin
    await server.register(fastifyJwt, {
      secret: process.env.JWT_SECRET,
      cookie: {
        cookieName: 'jansetu_token',
        signed: false
      }
    });

    // 6. Register Core API Routes. Prisma owns the single bounded database pool.
    await server.register(apiRoutes);

    // 7. Health Check Route
    server.get('/health', async (req, reply) => {
      return { 
        status: 'ok', 
        service: 'JanSetu DMFT Backend Engine (TypeScript)', 
        env: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        timestamp: new Date().toISOString() 
      };
    });

    // 8. Centralized request completion logging and error handling.
    server.addHook('onRequest', async (request, reply) => {
      requestStartedAt.set(request, Date.now());
      reply.header('X-Request-ID', request.id);
      request.log.info({ requestId: request.id, method: request.method, route: request.url }, 'Request started');
    });
    server.addHook('onSend', async (request, reply, payload) => {
      if (reply.statusCode < 400 || typeof payload !== 'string') return payload;
      try {
        const parsed = JSON.parse(payload) as { success?: boolean; error?: unknown };
        if (parsed.success === false && parsed.error && typeof parsed.error === 'object') return payload;
        const message = typeof parsed.error === 'string' && reply.statusCode < 500
          ? parsed.error
          : 'The request could not be completed.';
        const code = reply.statusCode === 400 ? ERROR_CODES.VALIDATION_ERROR
          : reply.statusCode === 401 ? ERROR_CODES.AUTHENTICATION_ERROR
            : reply.statusCode === 403 ? ERROR_CODES.AUTHORIZATION_ERROR
              : reply.statusCode === 404 ? ERROR_CODES.NOT_FOUND
                : reply.statusCode === 409 ? ERROR_CODES.CONFLICT
                  : reply.statusCode === 429 ? ERROR_CODES.RATE_LIMITED
                    : ERROR_CODES.INTERNAL_ERROR;
        return JSON.stringify(toErrorResponse(new AppError(code, message, reply.statusCode), request.id));
      } catch {
        return payload;
      }
    });
    server.addHook('onResponse', async (request, reply) => {
      request.log.info({
        requestId: request.id,
        method: request.method,
        route: request.routeOptions.url || request.url,
        statusCode: reply.statusCode,
        durationMs: Date.now() - (requestStartedAt.get(request) || Date.now())
      }, 'Request completed');
    });
    installErrorHandler(server);

    // 9. Start Listening
    const PORT = process.env.PORT || 8080;
    const HOST = process.env.HOST || '0.0.0.0';

    await server.listen({ port: Number(PORT), host: HOST });
    console.log(`🚀 JanSetu Fastify Backend Engine (TypeScript) running on http://${HOST}:${PORT}`);

    startStatisticalAnalysisRefreshWorker(server.log);

  } catch (err) {
    const startupError = err as NodeJS.ErrnoException;
    if (startupError.code === 'EADDRINUSE') {
      server.log.error(
        `Backend could not start because port ${process.env.PORT || 8080} is already in use. ` +
        'The existing JanSetu backend was left untouched; stop the old process or use another PORT.'
      );
      process.exitCode = 1;
      return;
    }
    server.log.error({ err, operation: 'startup' }, 'Backend startup failed');
    process.exitCode = 1;
  }
}

// Graceful Shutdown Handlers (SIGINT / SIGTERM)
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
  shuttingDown = true;
  
  try {
    stopStatisticalAnalysisRefreshWorker();
    await server.close();
    await prisma.$disconnect();
    console.log('✅ Server & Database pool closed cleanly.');
    process.exit(0);
  } catch (err) {
    server.log.error({ err, operation: 'shutdown' }, 'Graceful shutdown failed');
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection detected:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception detected:', err);
});

start();
