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

function formatVillageRecord(v: any) {
  const qm = (v.qualityMetrics as Record<string, any>) || {};
  const vs = (v.villageSurvey as Record<string, any>) || {};
  const surveyedHouseholds = (v as any).surveyedHouseholds ?? 0;
  const completionPercent = v.totalHouseholds > 0 
    ? Math.min(100, Math.round((surveyedHouseholds / v.totalHouseholds) * 100))
    : 0;

  return {
    ...v,
    hasAnganwadi: qm.hasAnganwadi || (v as any).hasAnganwadi || 'Not reported',
    odfStatus: qm.odfStatus || (v as any).odfStatus || 'Not reported',
    villageSurvey: vs,
    surveyedHouseholds,
    completionPercent,
    updatedAt: v.updatedAt ? v.updatedAt.toISOString() : undefined
  };
}

export async function getAllVillageProfiles(req: FastifyRequest, reply: FastifyReply) {
  const now = Date.now();
  if (cachedVillages && now < villageExpiry) {
    return reply.send(cachedVillages);
  }

  try {
    const [villages, householdCounts] = await Promise.all([
      prisma.villageProfile.findMany({
        orderBy: { villageName: 'asc' }
      }),
      prisma.householdSurvey.groupBy({
        by: ['villageName'],
        _count: { id: true }
      })
    ]);

    const countMap: Record<string, number> = {};
    householdCounts.forEach((c) => {
      countMap[c.villageName] = c._count.id;
    });

    const result: Record<string, any> = {};
    villages.forEach((v) => {
      const surveyedCount = countMap[v.villageName] ?? 0;
      result[v.villageName] = formatVillageRecord({ ...v, surveyedHouseholds: surveyedCount });
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
    const village = await prisma.villageProfile.findUnique({
      where: { villageName }
    });
    if (!village) {
      return reply.status(404).send({ error: 'Village profile not found' });
    }
    return reply.send(formatVillageRecord(village));
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Village profile lookup failed');
  }
}

export async function saveVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  const body = (req.body || {}) as any;
  const {
    block,
    panchayat,
    villageName,
    totalPopulation,
    totalHouseholds,
    scCount,
    stCount,
    puccaHouses,
    semiPuccaHouses,
    kacchaHouses,
    mineDistanceKm,
    hasPuccaRoad,
    monsoonCutOff,
    schoolType,
    hospitalType,
    electrification,
    hasAnganwadi,
    odfStatus,
    quality,
    gapMatrix,
    villageSurvey
  } = body;

  if (!villageName || !block || !panchayat) {
    return reply.status(400).send({ error: 'villageName, block, and panchayat are required' });
  }

  const mergedQualityMetrics = {
    ...(quality || {}),
    hasAnganwadi: hasAnganwadi || (quality && quality.hasAnganwadi) || 'Not reported',
    odfStatus: odfStatus || (quality && quality.odfStatus) || 'Not reported'
  };

  try {
    const upserted = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT pg_advisory_xact_lock(hashtext(${villageName}), -1);
      `;
      const existing = await tx.villageProfile.findUnique({ where: { villageName } });
      const actorId = getActorId(req);
      const record = await tx.villageProfile.upsert({
        where: { villageName },
        update: {
          block,
          panchayat,
          totalPopulation: totalPopulation || 0,
          totalHouseholds: totalHouseholds || 0,
          scCount: scCount || 0,
          stCount: stCount || 0,
          puccaHouses: puccaHouses || 0,
          semiPuccaHouses: semiPuccaHouses || 0,
          kacchaHouses: kacchaHouses || 0,
          mineDistanceKm: mineDistanceKm || 'Not reported',
          hasPuccaRoad: hasPuccaRoad || 'Not reported',
          monsoonCutOff: monsoonCutOff || 'Not reported',
          schoolType: schoolType || 'Not reported',
          hospitalType: hospitalType || 'Not reported',
          electrification: electrification || 'Not reported',
          qualityMetrics: mergedQualityMetrics,
          gapMatrix: gapMatrix || {},
          villageSurvey: villageSurvey || {},
          version: { increment: 1 }
        },
        create: {
          block,
          panchayat,
          villageName,
          totalPopulation: totalPopulation || 0,
          totalHouseholds: totalHouseholds || 0,
          scCount: scCount || 0,
          stCount: stCount || 0,
          puccaHouses: puccaHouses || 0,
          semiPuccaHouses: semiPuccaHouses || 0,
          kacchaHouses: kacchaHouses || 0,
          mineDistanceKm: mineDistanceKm || 'Not reported',
          hasPuccaRoad: hasPuccaRoad || 'Not reported',
          monsoonCutOff: monsoonCutOff || 'Not reported',
          schoolType: schoolType || 'Not reported',
          hospitalType: hospitalType || 'Not reported',
          electrification: electrification || 'Not reported',
          qualityMetrics: mergedQualityMetrics,
          gapMatrix: gapMatrix || {},
          villageSurvey: villageSurvey || {},
          createdBy: actorId
        }
      });
      await writeAuditLog(tx, {
        entityType: 'village', entityId: record.id, action: existing ? 'updated' : 'created', changedBy: actorId,
        changes: {
          reason: 'Village survey submission',
          changedFields: Object.keys(body),
          before: toAuditSnapshot(existing),
          after: toAuditSnapshot(record)
        }
      });
      return record;
    });

    invalidateVillageCache();
    invalidateAnalyticsCache();
    return reply.status(200).send({ success: true, data: formatVillageRecord(upserted) });
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Village profile save failed');
  }
}

export async function patchVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  const params = (req.params || {}) as { id: string };
  const { id } = params;
  const body = (req.body || {}) as any;
  const { version, ...updates } = body;

  if (!version) {
    return reply.status(400).send({ error: 'Record version is required for optimistic locking update' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const before = await tx.villageProfile.findUnique({ where: { id } });
      if (!before || before.version !== version) return null;

      const updated = await tx.villageProfile.updateMany({
        where: { id, version },
        data: {
          totalPopulation: updates.totalPopulation !== undefined ? updates.totalPopulation : undefined,
          totalHouseholds: updates.totalHouseholds !== undefined ? updates.totalHouseholds : undefined,
          qualityMetrics: updates.quality !== undefined ? updates.quality : undefined,
          gapMatrix: updates.gapMatrix !== undefined ? updates.gapMatrix : undefined,
          villageSurvey: updates.villageSurvey !== undefined ? updates.villageSurvey : undefined,
          version: { increment: 1 }
        }
      });
      if (updated.count === 0) return null;

      const record = await tx.villageProfile.findUnique({ where: { id } });
      if (!record) return null;
      await writeAuditLog(tx, {
        entityType: 'village', entityId: id, action: 'updated', changedBy: getActorId(req),
        changes: {
          reason: 'Village survey correction',
          changedFields: Object.keys(updates),
          before: toAuditSnapshot(before),
          after: toAuditSnapshot(record)
        }
      });
      return record;
    });

    if (!result) {
      return reply.status(409).send({ error: 'Conflict: Village profile was updated by another user. Reload and try again.' });
    }

    invalidateVillageCache();
    invalidateAnalyticsCache();
    return reply.send({ success: true, data: result ? formatVillageRecord(result) : null });
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Village profile update failed');
  }
}

export async function deleteVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  const params = (req.params || {}) as { id: string };
  const { id } = params;
  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const record = await tx.villageProfile.delete({ where: { id } });
      await writeAuditLog(tx, {
        entityType: 'village', entityId: id, action: 'deleted', changedBy: getActorId(req),
        changes: { reason: 'Administrative village deletion', before: toAuditSnapshot(record), after: null }
      });
      return record;
    });
    invalidateVillageCache();
    invalidateAnalyticsCache();
    return reply.send({ success: true, data: formatVillageRecord(deleted) });
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Village profile delete failed');
  }
}

