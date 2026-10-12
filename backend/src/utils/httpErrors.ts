import { FastifyReply, FastifyRequest } from 'fastify';
import { withErrorContext } from './errors';

export function sendInternalError(
  req: FastifyRequest,
  reply: FastifyReply,
  error: unknown,
  operation: string
): FastifyReply {
  void req;
  void reply;
  throw withErrorContext(error, { operation, stage: 'controller' });
}