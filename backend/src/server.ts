import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import compress from '@fastify/compress';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import fastifyPostgres from '@fastify/postgres';
import fastifyJwt from '@fastify/jwt';
import prisma from './config/prisma';
import apiRoutes from './routes/api';

const server = Fastify({
  logger: process.env.NODE_ENV === 'production' ? { level: 'error' } : true,
  connectionTimeout: Number(process.env.CONNECTION_TIMEOUT || 10000),
  keepAliveTimeout: Number(process.env.KEEP_ALIVE_TIMEOUT || 5000),
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

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const REFRESH_RETRY_DELAYS_MS = [5000, 15000, 30000];
let refreshTimer: NodeJS.Timeout | undefined;
let shuttingDown = false;

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, milliseconds);
    timer.unref();
  });
}

async function refreshAnalyticsView(): Promise<void> {
  for (let attempt = 0; attempt <= REFRESH_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const refreshed = await prisma.$transaction(async (tx) => {
        const locks = await tx.$queryRaw<Array<{ acquired: boolean }>>`
          SELECT pg_try_advisory_xact_lock(hashtext('jansetu-analytics'), hashtext('mv_district_cluster_analytics')) AS acquired;
        `;
        if (!locks[0]?.acquired) return false;

        await tx.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_district_cluster_analytics`;
        return true;
      });
      if (refreshed) {
        server.log.info('Background refresh of mv_district_cluster_analytics completed.');
      }
      return;
    } catch (error) {
      if (attempt === REFRESH_RETRY_DELAYS_MS.length) {
        server.log.error({ err: error }, 'Materialized view refresh failed after retries.');
        return;
      }

      const retryDelay = REFRESH_RETRY_DELAYS_MS[attempt];
      server.log.warn({ err: error, retryInMs: retryDelay }, 'Materialized view refresh failed; retry scheduled.');
      await delay(retryDelay);
    }
  }
}

function scheduleAnalyticsRefresh(waitMs = REFRESH_INTERVAL_MS): void {
  if (shuttingDown) return;
  refreshTimer = setTimeout(async () => {
    await refreshAnalyticsView();
    scheduleAnalyticsRefresh();
  }, waitMs);
  refreshTimer.unref();
}

async function start() {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be configured with at least 32 characters');
    }

    // 1. Security Headers Plugin
    await server.register(helmet, {
      contentSecurityPolicy: false
    });

    await server.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
      }
    });

    // 2. High-Speed Compression (Brotli + Gzip)
    await server.register(compress, {
      threshold: Number(process.env.COMPRESS_THRESHOLD || 1024),
      encodings: ['br', 'gzip', 'deflate']
    });

    // 3. Environment-Driven Rate Limiter
    await server.register(rateLimit, {
      max: Number(process.env.RATE_LIMIT_MAX || 10000),
      timeWindow: (process.env.RATE_LIMIT_WINDOW as string) || '1 minute'
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
      secret: process.env.JWT_SECRET
    });

    // 6. PostgreSQL Plugin
    try {
      await server.register(fastifyPostgres, {
        connectionString: process.env.DATABASE_URL
      });
      server.log.info('✅ PostgreSQL Pool Connected!');
    } catch (dbErr: any) {
      server.log.warn('⚠️ PostgreSQL pool connection notice: ' + dbErr.message);
    }

    // 7. Register Core API Routes
    await server.register(apiRoutes);

    // 8. Health Check Route
    server.get('/health', async (req, reply) => {
      return { 
        status: 'ok', 
        service: 'JanSetu DMFT Backend Engine (TypeScript)', 
        env: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        timestamp: new Date().toISOString() 
      };
    });

    // 9. Centralized Enterprise Error Handler
    server.setErrorHandler((error: any, req, reply) => {
      server.log.error(error);

      // Prisma Unique Constraint Violation
      if (error.code === 'P2002') {
        return reply.status(400).send({
          error: 'House number or village record already exists.',
          code: 'P2002',
          statusCode: 400
        });
      }

      // Prisma Record Not Found
      if (error.code === 'P2025') {
        return reply.status(404).send({
          error: 'Target census record not found.',
          code: 'P2025',
          statusCode: 404
        });
      }

      // Rate Limit Error
      if (error.statusCode === 429) {
        return reply.status(429).send({
          error: 'Too many requests. Rate limit exceeded.',
          statusCode: 429
        });
      }

      // JWT Authorization Error
      if (error.statusCode === 401 || error.name === 'UnauthorizedError') {
        return reply.status(401).send({
          error: 'Unauthorized: Invalid or missing token.',
          statusCode: 401
        });
      }

      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send({
        error: statusCode >= 500 ? 'Internal Server Error' : error.message || 'Internal Server Error',
        statusCode
      });
    });

    // 10. Start Listening
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '0.0.0.0';

    await server.listen({ port: Number(PORT), host: HOST });
    console.log(`🚀 JanSetu Fastify Backend Engine (TypeScript) running on http://${HOST}:${PORT}`);

    // Schedule only after the previous refresh and its retries have completed.
    scheduleAnalyticsRefresh();

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Graceful Shutdown Handlers (SIGINT / SIGTERM)
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
  shuttingDown = true;
  if (refreshTimer) clearTimeout(refreshTimer);
  try {
    await server.close();
    await prisma.$disconnect();
    console.log('✅ Server & Database pool closed cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
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
