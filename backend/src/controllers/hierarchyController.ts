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
    const records = await prisma.narayanpurHierarchy.findMany({
      orderBy: [{ blockName: 'asc' }, { panchayatName: 'asc' }, { villageName: 'asc' }]
    });

    if (records.length === 0) {
      return reply.status(503).send({ error: 'Village hierarchy has not been seeded.' });
    }

    const blockMap = new Map<string, {
      id: string;
      blockName: string;
      blockNameEnglish: string;
      panchayats: Map<string, {
        id: string;
        name: string;
        nameEnglish: string;
        villages: Array<{ id: string; nameEnglish: string; nameHindi: string; action: string; population: number }>;
      }>;
    }>();
    records.forEach((row) => {
      let block = blockMap.get(row.blockName);
      if (!block) {
        const englishName = row.blockNameEnglish || row.blockName;
        block = {
          id: englishName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          blockName: row.blockName,
          blockNameEnglish: englishName,
          panchayats: new Map()
        };
        blockMap.set(row.blockName, block);
      }

      let panchayat = block.panchayats.get(row.panchayatName);
      if (!panchayat) {
        const englishName = row.panchayatNameEnglish || row.panchayatName;
        panchayat = {
          id: `${block.id}-${englishName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
          name: row.panchayatName,
          nameEnglish: englishName,
          villages: []
        };
        block.panchayats.set(row.panchayatName, panchayat);
      }

      panchayat.villages.push({
        id: String(row.id),
        nameEnglish: row.villageNameEnglish || row.villageName,
        nameHindi: row.villageName,
        action: row.affectedStatus || 'Direct Affected',
        population: row.population
      });
    });

    const hierarchy = Array.from(blockMap.values()).map((block) => ({
      id: block.id,
      blockName: block.blockName,
      blockNameEnglish: block.blockNameEnglish,
      panchayats: Array.from(block.panchayats.values())
    }));

    cachedHierarchy = hierarchy;
    hierarchyExpiry = now + 300000;
    return reply.send(hierarchy);
  } catch (error) {
    req.log.error({ err: error }, 'Village hierarchy query failed');
    return reply.status(503).send({ error: 'Village hierarchy is temporarily unavailable.' });
  }
}
