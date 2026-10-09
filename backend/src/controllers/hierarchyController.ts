import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/prisma';

let cachedHierarchy: any = null;
let hierarchyExpiry = 0;

export async function getHierarchy(req: FastifyRequest, reply: FastifyReply) {
  const now = Date.now();
  if (cachedHierarchy && now < hierarchyExpiry) {
    return reply.send(cachedHierarchy);
  }

  try {
    // Query the clean relational hierarchy: Block → GramPanchayat → Village
    const blocks = await prisma.block.findMany({
      orderBy: { nameHindi: 'asc' },
      include: {
        gramPanchayats: {
          orderBy: { nameHindi: 'asc' },
          include: {
            villages: {
              orderBy: { nameHindi: 'asc' }
            }
          }
        }
      }
    });

    if (blocks.length === 0) {
      return reply.status(503).send({ error: 'Village hierarchy has not been seeded.' });
    }

    // Shape response to match the frontend Block[] type from narayanpurHierarchy.ts
    const hierarchy = blocks.map((block) => ({
      id: block.nameEnglish.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      blockName: block.nameHindi,
      blockNameEnglish: block.nameEnglish,
      panchayats: block.gramPanchayats.map((gp) => ({
        id: `${block.nameEnglish.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${gp.nameEnglish.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: gp.nameHindi,
        nameEnglish: gp.nameEnglish,
        villages: gp.villages.map((v) => ({
          id: v.id,
          nameHindi: v.nameHindi,
          nameEnglish: v.nameEnglish,
          action: v.affectedStatus,
          population: v.population
        }))
      }))
    }));

    cachedHierarchy = hierarchy;
    hierarchyExpiry = now + 300000; // 5 min cache
    return reply.send(hierarchy);
  } catch (error) {
    req.log.error({ err: error }, 'Village hierarchy query failed');
    return reply.status(503).send({ error: 'Village hierarchy is temporarily unavailable.' });
  }
}
