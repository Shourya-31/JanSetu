import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/prisma';
import { verifyPassword } from '../utils/password';

export async function login(req: FastifyRequest, reply: FastifyReply) {
  const { role, identifier, password } = req.body as {
    role: 'admin' | 'surveyor';
    identifier: string;
    password: string;
  };

  try {
    const user = await prisma.user.findUnique({
      where: { userCode: identifier }
    });

    if (!user || user.role !== role || !(await verifyPassword(password, user.passwordHash))) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = await reply.jwtSign({
      id: user.id,
      userCode: user.userCode,
      role: user.role
    }, { expiresIn: '8h' });

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
    req.log.error({ err }, 'Authentication request failed');
    return reply.status(500).send({ error: 'Authentication failed' });
  }
}

export async function demoSurveyorLogin(_req: FastifyRequest, reply: FastifyReply) {
  const user = {
    id: 'demo-surveyor',
    userCode: 'DEMO-SURVEYOR',
    role: 'surveyor' as const,
    fullName: 'Demo Surveyor'
  };
  const token = await reply.jwtSign({ ...user, demo: true }, { expiresIn: '8h' });

  return reply.send({ success: true, token, user });
}
