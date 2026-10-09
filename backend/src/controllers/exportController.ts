import { FastifyRequest, FastifyReply } from 'fastify';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import prisma from '../config/prisma';

export async function exportHouseholdsCsv(req: FastifyRequest, reply: FastifyReply) {
  // User explicitly said: "for now dont do any work in admin section it will be done later"
  // Export is part of admin, so we will stub it to avoid TS errors.
  return reply.status(501).send({ error: 'Export is disabled during migration' });
}
