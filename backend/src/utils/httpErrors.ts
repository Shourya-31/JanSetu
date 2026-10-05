import { FastifyReply, FastifyRequest } from 'fastify';

export function sendInternalError(
  req: FastifyRequest,
  reply: FastifyReply,
  error: unknown,
  operation: string
): FastifyReply {
  req.log.error({ err: error }, operation);
  return reply.status(500).send({ error: 'Internal Server Error' });
}