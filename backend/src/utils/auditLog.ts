import { FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';

export function getActorId(req: FastifyRequest): string {
  const claims = req.user as { id?: unknown };
  if (typeof claims?.id !== 'string') {
    throw new Error('Authenticated token is missing a user id');
  }
  return claims.id;
}

export function toAuditSnapshot(record: object | null): Record<string, unknown> | null {
  return record ? JSON.parse(JSON.stringify(record)) : null;
}

export async function writeAuditLog(
  tx: Prisma.TransactionClient,
  entry: {
    entityType: string;
    entityId: string;
    action: string;
    changedBy: string;
    changes: Record<string, unknown>;
  }
): Promise<void> {
  await tx.surveyAuditLog.create({
    data: {
      ...entry,
      changes: entry.changes as Prisma.InputJsonValue
    }
  });
}