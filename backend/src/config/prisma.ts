import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be configured');
}

function databaseUrlWithPoolSettings(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  const connectionLimit = Number(process.env.PRISMA_CONNECTION_LIMIT || 10);
  const poolTimeout = Number(process.env.PRISMA_POOL_TIMEOUT || 10);
  const connectTimeout = Number(process.env.PRISMA_CONNECT_TIMEOUT || 10);

  if (!Number.isInteger(connectionLimit) || connectionLimit < 1 || connectionLimit > 100) {
    throw new Error('PRISMA_CONNECTION_LIMIT must be an integer between 1 and 100');
  }
  for (const [key, value] of [['connection_limit', connectionLimit], ['pool_timeout', poolTimeout], ['connect_timeout', connectTimeout]] as const) {
    if (!Number.isInteger(value) || value < 1) throw new Error(`${key} must be a positive integer`);
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrlWithPoolSettings(process.env.DATABASE_URL) } },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

export default prisma;
