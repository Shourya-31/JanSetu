import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/prisma';

const DEFAULT_HIERARCHY = [
  {
    blockName: 'Narayanpur',
    panchayats: [
      { name: 'Khadkagaon', villages: [{ nameEnglish: 'Khadkagaon', nameHindi: 'खड़कागांव' }, { nameEnglish: 'Khairabhat', nameHindi: 'खैराभाट' }] },
      { name: 'Kerlapal', villages: [{ nameEnglish: 'Kerlapal', nameHindi: 'केरलापाल' }] },
      { name: 'Binjali', villages: [{ nameEnglish: 'Binjali', nameHindi: 'बिंजली' }, { nameEnglish: 'Telsi', nameHindi: 'तेलसी' }] },
      { name: 'Sulenga', villages: [{ nameEnglish: 'Sulenga', nameHindi: 'सुलेंगा' }, { nameEnglish: 'Guriya', nameHindi: 'गुरिया' }] },
      { name: 'Karlakha', villages: [{ nameEnglish: 'Karlakha', nameHindi: 'करलखा' }, { nameEnglish: 'Kanera', nameHindi: 'कनेरा' }, { nameEnglish: 'Paturbeda', nameHindi: 'पातुरबेड़ा' }] },
      { name: 'Edka', villages: [{ nameEnglish: 'Edka', nameHindi: 'एड़का' }, { nameEnglish: 'Irko', nameHindi: 'ईरको' }, { nameEnglish: 'Kanagaon', nameHindi: 'कानागांव' }] }
    ]
  }
];

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
      cachedHierarchy = DEFAULT_HIERARCHY;
      hierarchyExpiry = now + 300000;
      return reply.send(DEFAULT_HIERARCHY);
    }

    const blockMap: Record<string, Record<string, Array<{ nameEnglish: string; nameHindi: string }>>> = {};
    records.forEach((row) => {
      if (!blockMap[row.blockName]) {
        blockMap[row.blockName] = {};
      }
      if (!blockMap[row.blockName][row.panchayatName]) {
        blockMap[row.blockName][row.panchayatName] = [];
      }
      blockMap[row.blockName][row.panchayatName].push({
        nameEnglish: row.villageName,
        nameHindi: row.villageName
      });
    });

    const hierarchy = Object.entries(blockMap).map(([blockName, panchayatsObj]) => ({
      blockName,
      panchayats: Object.entries(panchayatsObj).map(([pName, vList]) => ({
        name: pName,
        villages: vList
      }))
    }));

    cachedHierarchy = hierarchy;
    hierarchyExpiry = now + 300000;
    return reply.send(hierarchy);
  } catch (err) {
    return reply.send(DEFAULT_HIERARCHY);
  }
}
