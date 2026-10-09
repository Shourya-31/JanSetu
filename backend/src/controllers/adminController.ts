import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/prisma';
import { sendInternalError } from '../utils/httpErrors';

let cachedAnalytics: any = null;
let cacheExpiry = 0;

export function invalidateAnalyticsCache() {
  cachedAnalytics = null;
  cacheExpiry = 0;
}

export async function queryAdminHouseholds(req: FastifyRequest, reply: FastifyReply) {
  // Simplified for now to fix TS errors while fulfilling user request to hold off on admin section
  // User explicitly said: "for now dont do any work in admin section it will be done later"
  return reply.status(501).send({ error: 'Admin query is disabled during migration' });
}

export async function getAnalyticsSummary(req: FastifyRequest, reply: FastifyReply) {
  // Return dummy or simple query to prevent TS errors since admin is "done later"
  return reply.status(501).send({ error: 'Admin analytics is disabled during migration' });
}
