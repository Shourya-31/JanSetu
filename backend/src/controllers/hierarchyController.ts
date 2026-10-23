import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/prisma';
import { withErrorContext } from '../utils/errors';

let cachedHierarchy: any = null;
let hierarchyExpiry = 0;
let hierarchyRefresh: Promise<any> | null = null;

export async function getHierarchy(req: FastifyRequest, reply: FastifyReply) {
  const now = Date.now();
  if (cachedHierarchy && now < hierarchyExpiry) {
    return reply.send(cachedHierarchy);
  }

  try {
    if (hierarchyRefresh) return reply.send(await hierarchyRefresh);
    hierarchyRefresh = (async () => {
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

    if (blocks.length === 0) throw new Error('Village hierarchy has not been seeded.');

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
    return hierarchy;
    })();
    return reply.send(await hierarchyRefresh);
  } catch (error) {
    hierarchyRefresh = null;
    throw withErrorContext(error, { operation: 'hierarchy.query', stage: 'database_query' });
  } finally {
    hierarchyRefresh = null;
  }
}

export async function getAdminHierarchy(req: FastifyRequest, reply: FastifyReply) {
  try {
    const blocks = await prisma.block.findMany({
      orderBy: { nameHindi: 'asc' },
      include: {
        gramPanchayats: {
          orderBy: { nameHindi: 'asc' },
          include: {
            villages: {
              orderBy: { nameHindi: 'asc' },
              include: { villageSurvey: { select: { isCompleted: true } } }
            }
          }
        }
      }
    });
    return reply.send(blocks.map((block) => ({
      id: String(block.id),
      blockName: block.nameHindi,
      blockNameEnglish: block.nameEnglish,
      panchayats: block.gramPanchayats.map((panchayat) => ({
        id: String(panchayat.id),
        name: panchayat.nameHindi,
        nameEnglish: panchayat.nameEnglish,
        villages: panchayat.villages.map((village) => ({
          id: String(village.id),
          nameHindi: village.nameHindi,
          nameEnglish: village.nameEnglish,
          action: village.affectedStatus,
          population: village.population,
          surveyStatus: village.villageSurvey?.isCompleted === true
            ? 'completed'
            : village.villageSurvey
              ? 'incomplete'
              : 'unavailable'
        }))
      }))
    })));
  } catch (error) {
    throw withErrorContext(error, { operation: 'admin.hierarchy.query', stage: 'database_query' });
  }
}
