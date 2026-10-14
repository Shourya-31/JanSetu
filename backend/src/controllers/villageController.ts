import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/prisma';
import { invalidateAnalyticsCache } from './adminController';
import { getActorId, toAuditSnapshot, writeAuditLog } from '../utils/auditLog';
import { sendInternalError } from '../utils/httpErrors';
import {
  canFinalizeSurvey,
  normalizeCompletedSections,
  progressForSections
} from '../utils/villageSurveyProgress';
import { mergePhotoUrls } from '../utils/villagePhotos';

let cachedVillages: any = null;
let villageExpiry = 0;
let villageRefresh: Promise<any> | null = null;

export function invalidateVillageCache() {
  cachedVillages = null;
  villageExpiry = 0;
}

function formatVillageRecord(v: any, surveyedHouseholds = 0) {
  const vs = v.villageSurvey || {};
  const surveyData = vs.surveyData && typeof vs.surveyData === 'object' ? vs.surveyData : {};
  const villagePhotos = mergePhotoUrls(vs.villagePhotos, (surveyData as Record<string, unknown>).villagePhotos);
  return {
    id: v.id,
    villageId: v.id,
    surveyId: vs.id,
    villageName: v.nameHindi,
    block: v.gramPanchayat?.block?.nameHindi || 'Unknown',
    panchayat: v.gramPanchayat?.nameHindi || 'Unknown',
    totalPopulation: vs.totalPopulation || 0,
    totalHouseholds: vs.totalHouseholds || 0,
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
    villagePhotos,
    villageSurvey: { ...vs, villagePhotos },
    completedSections: Array.isArray(vs.completedSections) ? vs.completedSections : [],
    progress: vs.isCompleted ? 100 : Number(vs.progress || 0),
    isCompleted: Boolean(vs.isCompleted),
    status: vs.isCompleted ? 'Completed' : (vs.progress > 0 ? 'In Progress' : 'Not Started'),
    surveyedHouseholds,
    completionPercent: vs.totalHouseholds ? Math.min(100, Math.round((surveyedHouseholds / vs.totalHouseholds) * 100)) : 0,
    updatedAt: vs.updatedAt?.toISOString(),
    version: vs.version || 1
  };
}

const villageInclude = { villageSurvey: true, gramPanchayat: { include: { block: true } } } as const;

export async function getAllVillageProfiles(req: FastifyRequest, reply: FastifyReply) {
  const now = Date.now();
  if (cachedVillages && now < villageExpiry) return reply.send(cachedVillages);
  try {
    if (villageRefresh) return reply.send(await villageRefresh);
    villageRefresh = (async () => {
    const [villages, householdCounts] = await Promise.all([
      prisma.village.findMany({ orderBy: { nameHindi: 'asc' }, include: villageInclude }),
      prisma.householdSurvey.groupBy({ by: ['villageId'], _count: { id: true } })
    ]);
    const countMap: Record<number, number> = {};
    householdCounts.forEach((c) => { countMap[c.villageId] = c._count.id; });
    const result: Record<string, any> = {};
    villages.forEach((v) => { result[String(v.id)] = formatVillageRecord(v, countMap[v.id] ?? 0); });
    cachedVillages = result;
    villageExpiry = now + 60000;
    return result;
    })();
    return reply.send(await villageRefresh);
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Village profile query failed');
  } finally {
    villageRefresh = null;
  }
}

function villageWhere(query: { villageId?: number; villageName?: string; block?: string; panchayat?: string }) {
  if (query.villageId) return { id: Number(query.villageId) };
  return {
    nameHindi: query.villageName,
    ...(query.panchayat ? { gramPanchayat: { nameHindi: query.panchayat, ...(query.block ? { block: { nameHindi: query.block } } : {}) } } : {})
  };
}

export async function getVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  const query = (req.query || {}) as { villageId?: number; villageName?: string; block?: string; panchayat?: string };
  if (!query.villageId && !query.villageName) return reply.status(400).send({ error: 'villageId or villageName is required' });
  try {
    const village = await prisma.village.findFirst({ where: villageWhere(query), include: villageInclude });
    if (!village) return reply.status(404).send({ error: 'Village profile not found' });
    const hhCount = await prisma.householdSurvey.count({ where: { villageId: village.id } });
    return reply.send(formatVillageRecord(village, hhCount));
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Village profile lookup failed');
  }
}

export async function saveVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  const body = (req.body || {}) as Record<string, any>;
  const villageName = typeof body.villageName === 'string' ? body.villageName.trim() : '';
  if (!body.villageId && !villageName) return reply.status(400).send({ error: 'villageId or villageName is required' });
  try {
    await prisma.$transaction(async (tx) => {
      const village = await tx.village.findFirst({
        where: villageWhere({ villageId: body.villageId, villageName, block: body.block, panchayat: body.panchayat }),
        include: villageInclude
      });
      if (!village) throw new Error('Village not found in hierarchy');
      const incoming = body.villageSurvey ?? body.data ?? body;
      const normalized = incoming && typeof incoming === 'object' ? incoming as Record<string, any> : {};
      const existing = village.villageSurvey as any;
      const previousData = existing?.surveyData && typeof existing.surveyData === 'object' ? existing.surveyData as Record<string, unknown> : {};
      const villagePhotos = mergePhotoUrls(
        existing?.villagePhotos,
        previousData.villagePhotos,
        normalized.villagePhotos,
        body.villagePhotos
      );
      const surveyData = { ...previousData, ...normalized, villagePhotos };
      const requested = Array.isArray(body.completedSections) ? body.completedSections : (Array.isArray(existing?.completedSections) ? existing.completedSections : []);
      const completedSections = normalizeCompletedSections(requested);
      const value = (key: string, alias?: string) => normalized[key] ?? (alias ? body[alias] : undefined) ?? existing?.[key] ?? null;
      const numberValue = (key: string, alias?: string) => {
        const v = value(key, alias);
        return v === null || v === '' ? null : Number(v);
      };
      const data = {
        totalHouseholds: numberValue('totalHouseholds'),
        totalPopulation: numberValue('totalPopulation'),
        scPopulation: numberValue('scPopulation', 'scCount'),
        stPopulation: numberValue('stPopulation', 'stCount'),
        puccaHouses: numberValue('puccaHouses'),
        rawHouses: numberValue('rawHouses', 'kacchaHouses'),
        road: value('road', 'hasPuccaRoad'),
        rainCutoff: value('rainCutoff', 'monsoonCutOff'),
        primarySchoolAvailable: value('primarySchoolAvailable', 'schoolType'),
        subHealthCenterAvailable: value('subHealthCenterAvailable', 'hospitalType'),
        electricity: value('electricity', 'electrification'),
        anganwadiWorkerPresent: value('anganwadiWorkerPresent', 'hasAnganwadi'),
        odf: value('odf', 'odfStatus'),
        villagePhotos,
        surveyData: surveyData as any,
        completedSections: completedSections as any,
        progress: progressForSections(completedSections),
        // Saving is never finalization. Only the finalize endpoint can set this true.
        isCompleted: Boolean(existing?.isCompleted),
        version: { increment: 1 }
      };
      const record = await tx.villageSurvey.upsert({
        where: { villageId: village.id },
        update: data,
        create: { village: { connect: { id: village.id } }, creator: { connect: { id: getActorId(req) } }, ...data, version: 1 }
      });
      await writeAuditLog(tx, {
        entityType: 'village', entityId: record.id, action: existing ? 'updated' : 'created', changedBy: getActorId(req),
        changes: { reason: 'Village survey section save', before: toAuditSnapshot(existing), after: toAuditSnapshot(record) }
      });
      const oldHouseholds = Number(existing?.totalHouseholds || 0);
      const newHouseholds = Number(data.totalHouseholds || 0);
      if (oldHouseholds !== newHouseholds) {
        await tx.village.update({ where: { id: village.id }, data: { totalHouseholds: newHouseholds } });
      }
    });
    invalidateVillageCache();
    invalidateAnalyticsCache();
    const saved = await prisma.village.findFirst({ where: body.villageId ? { id: Number(body.villageId) } : { nameHindi: villageName }, include: villageInclude });
    return reply.send({ success: true, data: formatVillageRecord(saved) });
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Village profile save failed');
  }
}

export async function finalizeVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  const villageId = Number((req.params as { id: string }).id);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const survey = await tx.villageSurvey.findUnique({ where: { villageId } });
      const completed = Array.isArray(survey?.completedSections) ? survey.completedSections as string[] : [];
      const data = survey?.surveyData && typeof survey.surveyData === 'object' ? survey.surveyData as Record<string, unknown> : {};
      if (!survey || !canFinalizeSurvey(completed, data)) {
        throw new Error('All 11 survey sections must be saved before finalization');
      }
      const updated = await tx.villageSurvey.update({ where: { villageId }, data: { isCompleted: true, progress: 100, version: { increment: 1 } } });
      await tx.village.update({ where: { id: villageId }, data: { isSurveyFilled: true } });
      return updated;
    });
    invalidateVillageCache();
    invalidateAnalyticsCache();
    return reply.send({ success: true, data: result });
  } catch (err: any) {
    if (err.message === 'All 11 survey sections must be saved before finalization') return reply.status(400).send({ error: err.message });
    return sendInternalError(req, reply, err, 'Village survey finalization failed');
  }
}

export async function patchVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  return reply.status(501).send({ error: 'Patch not supported, use save instead' });
}

export async function deleteVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  return reply.status(501).send({ error: 'Delete not supported directly' });
}
