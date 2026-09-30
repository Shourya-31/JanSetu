import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgres://adityaboxi@localhost:5432/jansetu';
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

export default prisma;
