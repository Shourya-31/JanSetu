import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/prisma';

export async function login(this: any, req: FastifyRequest, reply: FastifyReply) {
  const body = (req.body || {}) as { role?: string; identifier?: string; password?: string };
  const { role, identifier, password } = body;

  if (!role || !identifier) {
    return reply.status(400).send({ error: 'Role and user identifier are required' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { userCode: identifier }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          userCode: identifier,
          fullName: role === 'admin' ? `District Collector (${identifier})` : `Field Surveyor (${identifier})`,
          role: role === 'admin' ? 'admin' : 'surveyor',
          passwordHash: password || '123456'
        }
      });
    }

    const token = this.jwt.sign({
      id: user.id,
      userCode: user.userCode,
      role: user.role
    });

    return reply.send({
      success: true,
      token,
      user: {
        id: user.id,
        userCode: user.userCode,
        role: user.role,
        fullName: user.fullName
      }
    });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message || 'Authentication failed' });
  }
}
