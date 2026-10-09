import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/prisma';
import { invalidateAnalyticsCache } from './adminController';
import { getActorId, toAuditSnapshot, writeAuditLog } from '../utils/auditLog';
import { sendInternalError } from '../utils/httpErrors';

let cachedVillages: any = null;
let villageExpiry = 0;

export function invalidateVillageCache() {
  cachedVillages = null;
  villageExpiry = 0;
}

function formatVillageRecord(v: any, surveyedHouseholds: number = 0) {
  const vs = v.villageSurvey || {};
  const totalHouseholds = vs.totalHouseholds || 0;
  const completionPercent = totalHouseholds > 0 
    ? Math.min(100, Math.round((surveyedHouseholds / totalHouseholds) * 100))
    : 0;

  return {
    id: vs.id || v.id,
    villageName: v.nameHindi,
    block: v.gramPanchayat?.block?.nameHindi || 'Unknown',
    panchayat: v.gramPanchayat?.nameHindi || 'Unknown',
    totalPopulation: vs.totalPopulation || 0,
    totalHouseholds,
    scCount: vs.scPopulation || 0,
    stCount: vs.stPopulation || 0,
    puccaHouses: vs.puccaHouses || 0,
    semiPuccaHouses: 0,
    kacchaHouses: vs.rawHouses || 0,
    mineDistanceKm: 'Not reported',
    hasPuccaRoad: vs.road || 'Not reported',
    monsoonCutOff: vs.rainCutoff || 'Not reported',
    schoolType: vs.primarySchoolAvailable || 'Not reported',
    hospitalType: vs.subHealthCenterAvailable || 'Not reported',
    electrification: vs.electricity || 'Not reported',
    hasAnganwadi: vs.anganwadiWorkerPresent || 'Not reported',
    odfStatus: vs.odf || 'Not reported',
    villagePhotos: vs.villagePhotos || [],
    villageSurvey: vs,
    surveyedHouseholds,
    completionPercent,
    updatedAt: vs.updatedAt ? vs.updatedAt.toISOString() : undefined,
    version: vs.version || 1
  };
}

export async function getAllVillageProfiles(req: FastifyRequest, reply: FastifyReply) {
  const now = Date.now();
  if (cachedVillages && now < villageExpiry) {
    return reply.send(cachedVillages);
  }

  try {
    const [villages, householdCounts] = await Promise.all([
      prisma.village.findMany({
        orderBy: { nameHindi: 'asc' },
        include: {
          villageSurvey: true,
          gramPanchayat: { include: { block: true } }
        }
      }),
      prisma.householdSurvey.groupBy({
        by: ['villageId'],
        _count: { id: true }
      })
    ]);

    const countMap: Record<number, number> = {};
    householdCounts.forEach((c) => {
      countMap[c.villageId] = c._count.id;
    });

    const result: Record<string, any> = {};
    villages.forEach((v) => {
      const surveyedCount = countMap[v.id] ?? 0;
      result[v.nameHindi] = formatVillageRecord(v, surveyedCount);
    });

    cachedVillages = result;
    villageExpiry = now + 60000;
    return reply.send(result);
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Village profile query failed');
  }
}

export async function getVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  const query = (req.query || {}) as { villageName?: string };
  const { villageName } = query;
  if (!villageName) {
    return reply.status(400).send({ error: 'villageName query parameter is required' });
  }

  try {
    const village = await prisma.village.findFirst({
      where: { nameHindi: villageName },
      include: {
        villageSurvey: true,
        gramPanchayat: { include: { block: true } }
      }
    });
    if (!village) {
      return reply.status(404).send({ error: 'Village profile not found' });
    }
    const hhCount = await prisma.householdSurvey.count({ where: { villageId: village.id } });
    return reply.send(formatVillageRecord(village, hhCount));
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Village profile lookup failed');
  }
}

export async function saveVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  const body = (req.body || {}) as any;
  const { villageName, villageSurvey } = body;

  if (!villageName) {
    return reply.status(400).send({ error: 'villageName is required' });
  }

  try {
    const upserted = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${villageName})::int, -1::int);
      `;
      
      const village = await tx.village.findFirst({
        where: { nameHindi: villageName },
        include: { villageSurvey: true, gramPanchayat: { include: { block: true } } }
      });
      if (!village) throw new Error('Village not found in hierarchy');

      const actorId = getActorId(req);
      const dataToSave = {
        totalHouseholds: Number(body.totalHouseholds || villageSurvey?.totalHouseholds || 0),
        totalPopulation: Number(body.totalPopulation || villageSurvey?.totalPopulation || 0),
        scPopulation: Number(body.scCount || villageSurvey?.scPopulation || 0),
        stPopulation: Number(body.stCount || villageSurvey?.stPopulation || 0),
        puccaHouses: Number(body.puccaHouses || villageSurvey?.puccaHouses || 0),
        rawHouses: Number(body.kacchaHouses || villageSurvey?.rawHouses || 0),
        road: body.hasPuccaRoad || villageSurvey?.road || '',
        rainCutoff: body.monsoonCutOff || villageSurvey?.rainCutoff || '',
        primarySchoolAvailable: body.schoolType || villageSurvey?.primarySchoolAvailable || '',
        subHealthCenterAvailable: body.hospitalType || villageSurvey?.subHealthCenterAvailable || '',
        electricity: body.electrification || villageSurvey?.electricity || '',
        anganwadiWorkerPresent: body.hasAnganwadi || villageSurvey?.anganwadiWorkerPresent || '',
        odf: body.odfStatus || villageSurvey?.odf || '',
        villagePhotos: body.villagePhotos || villageSurvey?.villagePhotos || [],
        version: { increment: 1 }
      };

      const record = await tx.villageSurvey.upsert({
        where: { villageId: village.id },
        update: dataToSave,
        create: {
          villageId: village.id,
          createdBy: actorId,
          ...dataToSave,
          version: 1
        }
      });

      await writeAuditLog(tx, {
        entityType: 'village', entityId: record.id, action: village.villageSurvey ? 'updated' : 'created', changedBy: actorId,
        changes: {
          reason: 'Village survey submission',
          before: toAuditSnapshot(village.villageSurvey),
          after: toAuditSnapshot(record)
        }
      });
      return record;
    });

    invalidateVillageCache();
    invalidateAnalyticsCache();
    
    const vFinal = await prisma.village.findFirst({
      where: { nameHindi: villageName },
      include: { villageSurvey: true, gramPanchayat: { include: { block: true } } }
    });
    
    return reply.status(200).send({ success: true, data: formatVillageRecord(vFinal) });
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Village profile save failed');
  }
}

export async function patchVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  // Not used properly in frontend with new schema, simplified implementation
  return reply.status(501).send({ error: 'Patch not supported, use save instead' });
}

export async function deleteVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  return reply.status(501).send({ error: 'Delete not supported directly' });
}
