import { FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';

export function getActorId(req: FastifyRequest): string | null {
  const claims = req.user as { id?: unknown; demo?: unknown; role?: unknown };
  if (claims?.demo === true && claims.role === 'surveyor') {
    return null;
  }
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
    changedBy: string | null;
    changes: Record<string, unknown>;
  }
): Promise<void> {
  await tx.surveyAuditLog.create({
    data: {
      ...entry,
      changes: {
        ...entry.changes,
        ...(entry.changedBy === null ? { actor: 'DEMO-SURVEYOR' } : {})
      } as Prisma.InputJsonValue
    }
  });
}
