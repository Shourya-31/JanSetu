import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../config/prisma';
import { withErrorContext } from '../utils/errors';

export async function getSurveyAuditLogs(req: FastifyRequest, reply: FastifyReply) {
  const query = req.query as {
    entityType?: 'household' | 'village';
    entityId?: string;
    limit?: number;
    cursor?: string;
  };
  const limit = query.limit ?? 50;

  try {
    const rows = await prisma.surveyAuditLog.findMany({
      where: {
        entityType: query.entityType,
        entityId: query.entityId
      },
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: [{ timestamp: 'desc' }, { id: 'desc' }],
      include: {
        user: {
          select: { id: true, userCode: true, fullName: true, role: true }
        }
      }
    });

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    return reply.send({
      data,
      nextCursor: hasMore ? data[data.length - 1].id : null
    });
  } catch (error) {
    throw withErrorContext(error, { operation: 'audit.logs.query', stage: 'database_query' });
  }
}