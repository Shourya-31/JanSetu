import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { withDbRetry } from '../utils/dbRetry';
import { invalidateAnalyticsCache } from './adminController';
import { invalidateVillageCache } from './villageController';
import { getActorId, toAuditSnapshot, writeAuditLog } from '../utils/auditLog';
import { sendInternalError } from '../utils/httpErrors';

export async function getHouseholdSurveys(req: FastifyRequest, reply: FastifyReply) {
  const query = (req.query || {}) as { villageName?: string };
  const { villageName } = query;
  if (!villageName) {
    return reply.status(400).send({ error: 'villageName query parameter is required' });
  }

  try {
    const households = await prisma.householdSurvey.findMany({
      where: { villageName },
      orderBy: { houseNumber: 'asc' }
    });

    const result: Record<number, any> = {};
    households.forEach((h) => {
      const answers = (h.surveyAnswers as Record<string, any>) || {};
      result[h.houseNumber] = {
        id: h.id,
        trackingId: h.trackingId,
        houseNumber: h.houseNumber,
        villageName: h.villageName,
        panchayat: answers.panchayat || answers.panchayatName || '',
        block: answers.block || answers.blockName || '',
        headName: h.headName,
        mobile: h.mobile,
        caste: h.caste,
        isBPL: h.isBPL,
        totalMembers: h.totalMembers,
        eldersCount: h.eldersCount,
        childrenCount: h.childrenCount,
        unemployedCount: h.unemployedCount,
        incomeSource: h.incomeSource,
        missingAadhaar: h.missingAadhaar,
        missingCasteCert: h.missingCasteCert,
        missingAyushman: h.missingAyushman,
        missingVoterId: h.missingVoterId,
        isMiningWorker: h.isMiningWorker,
        houseType: h.houseType,
        hasToilet: h.hasToilet,
        hasTapWater: h.hasTapWater,
        auditStatus: h.auditStatus,
        verificationResult: h.verificationResult,
        verifiedBy: h.verifiedBy,
        verifiedAt: h.verifiedAt ? h.verifiedAt.toISOString() : undefined,
        registryStatus: h.registryStatus,
        correctionTicketId: h.correctionTicketId,
        correctionReason: h.correctionReason,
        correctionNote: h.correctionNote,
        correctionCreatedAt: h.correctionCreatedAt ? h.correctionCreatedAt.toISOString() : undefined,
        auditNote: h.auditNote,
        version: h.version,
        submittedAt: h.submittedAt ? h.submittedAt.toISOString() : new Date().toISOString(),
        surveyAnswers: answers,
        ...answers
      };
    });

    return reply.send(result);
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Household survey query failed');
  }
}

export async function createHouseholdSlots(req: FastifyRequest, reply: FastifyReply) {
  const { villageName, block, panchayat, count } = req.body as {
    villageName: string;
    block: string;
    panchayat: string;
    count: number;
  };

  try {
    const data = await prisma.$transaction(async (tx) => {
      const actorId = getActorId(req);
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${villageName}), -1);
      `;
      const existingVillage = await tx.villageProfile.findUnique({ where: { villageName } });
      const village = await tx.villageProfile.upsert({
        where: { villageName },
        update: {},
        create: {
          villageName, block, panchayat,
          mineDistanceKm: 'Not reported', hasPuccaRoad: 'Not reported',
          monsoonCutOff: 'Not reported', schoolType: 'Not reported',
          hospitalType: 'Not reported', electrification: 'Not reported', createdBy: actorId
        }
      });
      if (!existingVillage) {
        await writeAuditLog(tx, {
          entityType: 'village', entityId: village.id, action: 'created', changedBy: actorId,
          changes: {
            reason: 'Village initialized for household survey',
            before: null,
            after: toAuditSnapshot(village)
          }
        });
      }

      const completionFields = [
        'generalCompleted', 'demographyCompleted', 'documentsCompleted', 'womenCompleted',
        'disabilityCompleted', 'educationCompleted', 'employmentCompleted', 'housingCompleted',
        'healthCompleted', 'shgCompleted', 'otherCompleted'
      ];
      const created = await tx.householdSurvey.createManyAndReturn({
        data: Array.from({ length: count }, (_, index) => {
          const houseNumber = index + 1;
          return {
            trackingId: `DMFT-HHD-${randomUUID()}`,
            villageName,
            houseNumber,
            headName: '',
            mobile: '',
            caste: '',
            isBPL: '',
            totalMembers: 1,
            eldersCount: 0,
            childrenCount: 0,
            unemployedCount: 0,
            incomeSource: '',
            missingAadhaar: 0,
            missingCasteCert: 0,
            missingAyushman: 0,
            missingVoterId: 0,
            isMiningWorker: '',
            houseType: '',
            hasToilet: '',
            hasTapWater: '',
            surveyAnswers: {
              villageName, block, panchayat, houseNumber,
              ...Object.fromEntries(completionFields.map((field) => [field, false]))
            },
            createdBy: actorId
          };
        }),
        skipDuplicates: true,
        select: { id: true, trackingId: true, houseNumber: true, version: true, surveyAnswers: true }
      });

      if (created.length > 0) {
        await tx.surveyAuditLog.createMany({
          data: created.map((record) => ({
            entityType: 'household',
            entityId: record.id,
            action: 'created',
            changedBy: actorId,
            changes: {
              reason: 'Household survey slot initialized',
              ...(actorId === null ? { actor: 'DEMO-SURVEYOR' } : {}),
              before: null,
              after: toAuditSnapshot(record)
            } as Prisma.InputJsonValue
          }))
        });
      }

      return tx.householdSurvey.findMany({
        where: { villageName, houseNumber: { lte: count } },
        orderBy: { houseNumber: 'asc' }
      });
    });

    invalidateAnalyticsCache();
    invalidateVillageCache();
    return reply.status(200).send({ success: true, data });
  } catch (error) {
    return sendInternalError(req, reply, error, 'Household survey slots initialization failed');
  }
}

export async function saveHouseholdSurvey(req: FastifyRequest, reply: FastifyReply) {
  const body = (req.body || {}) as any;
  const villageName = body.villageName || (body.data && body.data.villageName);
  const houseNumber = body.houseNumber !== undefined ? Number(body.houseNumber) : (body.data && body.data.houseNumber !== undefined ? Number(body.data.houseNumber) : undefined);
  const payloadData = body.data || body;

  if (!villageName || houseNumber === undefined || !payloadData) {
    return reply.status(400).send({ error: 'villageName, houseNumber, and data payload are required' });
  }

  try {
    const trackingId = payloadData.trackingId || `DMFT-HHD-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = await withDbRetry(async () => {
      return await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${villageName}), ${houseNumber});
        `;
        const actorId = getActorId(req);
        const existing = await tx.householdSurvey.findUnique({
          where: { uniqueHousePerVillage: { villageName, houseNumber } }
        });

        // Ensure parent VillageProfile exists to satisfy FK constraint
        const existingVillage = await tx.villageProfile.findUnique({ where: { villageName } });
        const village = await tx.villageProfile.upsert({
          where: { villageName },
          update: {},
          create: {
            villageName,
            block: payloadData.blockName || payloadData.block || 'Not reported',
            panchayat: payloadData.panchayatName || payloadData.panchayat || 'Not reported',
            mineDistanceKm: 'Not reported',
            hasPuccaRoad: 'Not reported',
            monsoonCutOff: 'Not reported',
            schoolType: 'Not reported',
            hospitalType: 'Not reported',
            electrification: 'Not reported',
            createdBy: actorId
          }
        });
        if (!existingVillage) {
          await writeAuditLog(tx, {
            entityType: 'village', entityId: village.id, action: 'created', changedBy: actorId,
            changes: { villageName, block: village.block, panchayat: village.panchayat, source: 'household_survey' }
          });
        }

        const survey = await tx.householdSurvey.upsert({
          where: {
            uniqueHousePerVillage: {
              villageName,
              houseNumber
            }
          },
          update: {
            headName: payloadData.headName || '',
            mobile: payloadData.mobile || '',
            caste: payloadData.caste || '',
            isBPL: payloadData.isBPL || '',
            totalMembers: Number(payloadData.totalMembers || 1),
            eldersCount: Number(payloadData.eldersCount || 0),
            childrenCount: Number(payloadData.childrenCount || 0),
            unemployedCount: Number(payloadData.unemployedCount || 0),
            incomeSource: payloadData.incomeSource || '',
            missingAadhaar: Number(payloadData.missingAadhaar || 0),
            missingCasteCert: Number(payloadData.missingCasteCert || 0),
            missingAyushman: Number(payloadData.missingAyushman || 0),
            missingVoterId: Number(payloadData.missingVoterId || 0),
            isMiningWorker: payloadData.isMiningWorker || '',
            houseType: payloadData.houseType || '',
            hasToilet: payloadData.hasToilet || '',
            hasTapWater: payloadData.hasTapWater || '',
            surveyAnswers: payloadData,
            version: { increment: 1 }
          },
          create: {
            trackingId,
            villageName,
            houseNumber,
            createdBy: actorId,
            headName: payloadData.headName || '',
            mobile: payloadData.mobile || '',
            caste: payloadData.caste || '',
            isBPL: payloadData.isBPL || '',
            totalMembers: Number(payloadData.totalMembers || 1),
            eldersCount: Number(payloadData.eldersCount || 0),
            childrenCount: Number(payloadData.childrenCount || 0),
            unemployedCount: Number(payloadData.unemployedCount || 0),
            incomeSource: payloadData.incomeSource || '',
            missingAadhaar: Number(payloadData.missingAadhaar || 0),
            missingCasteCert: Number(payloadData.missingCasteCert || 0),
            missingAyushman: Number(payloadData.missingAyushman || 0),
            missingVoterId: Number(payloadData.missingVoterId || 0),
            isMiningWorker: payloadData.isMiningWorker || '',
            houseType: payloadData.houseType || '',
            hasToilet: payloadData.hasToilet || '',
            hasTapWater: payloadData.hasTapWater || '',
            surveyAnswers: payloadData
          }
        });

        await writeAuditLog(tx, {
          entityType: 'household',
          entityId: survey.id,
          action: existing ? 'updated' : 'created',
          changedBy: actorId,
          changes: {
            reason: 'Household survey submission',
            changedFields: Object.keys(payloadData),
            before: toAuditSnapshot(existing),
            after: toAuditSnapshot(survey)
          }
        });
        return survey;
      });
    });

    invalidateAnalyticsCache();
    invalidateVillageCache();
    return reply.status(200).send({ success: true, data: result });
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Household survey save failed');
  }
}

export async function patchHouseholdSurvey(req: FastifyRequest, reply: FastifyReply) {
  const params = (req.params || {}) as { id: string };
  const { id } = params;
  const body = (req.body || {}) as any;
  const { version, ...updates } = body;

  try {
    const dataToUpdate: any = {};
    if (updates.headName !== undefined) dataToUpdate.headName = updates.headName;
    if (updates.mobile !== undefined) dataToUpdate.mobile = updates.mobile;
    if (updates.caste !== undefined) dataToUpdate.caste = updates.caste;
    if (updates.isBPL !== undefined) dataToUpdate.isBPL = updates.isBPL;
    if (updates.totalMembers !== undefined) dataToUpdate.totalMembers = Number(updates.totalMembers);
    if (updates.eldersCount !== undefined) dataToUpdate.eldersCount = Number(updates.eldersCount);
    if (updates.childrenCount !== undefined) dataToUpdate.childrenCount = Number(updates.childrenCount);
    if (updates.unemployedCount !== undefined) dataToUpdate.unemployedCount = Number(updates.unemployedCount);
    if (updates.incomeSource !== undefined) dataToUpdate.incomeSource = updates.incomeSource;
    if (updates.missingAadhaar !== undefined) dataToUpdate.missingAadhaar = Number(updates.missingAadhaar);
    if (updates.missingCasteCert !== undefined) dataToUpdate.missingCasteCert = Number(updates.missingCasteCert);
    if (updates.missingAyushman !== undefined) dataToUpdate.missingAyushman = Number(updates.missingAyushman);
    if (updates.missingVoterId !== undefined) dataToUpdate.missingVoterId = Number(updates.missingVoterId);
    if (updates.isMiningWorker !== undefined) dataToUpdate.isMiningWorker = updates.isMiningWorker;
    if (updates.houseType !== undefined) dataToUpdate.houseType = updates.houseType;
    if (updates.hasToilet !== undefined) dataToUpdate.hasToilet = updates.hasToilet;
    if (updates.hasTapWater !== undefined) dataToUpdate.hasTapWater = updates.hasTapWater;
    if (updates.surveyAnswers !== undefined || updates.data !== undefined) dataToUpdate.surveyAnswers = updates.surveyAnswers || updates.data;
    if (updates.auditStatus !== undefined) dataToUpdate.auditStatus = updates.auditStatus;
    if (updates.registryStatus !== undefined) dataToUpdate.registryStatus = updates.registryStatus;

    dataToUpdate.version = { increment: 1 };
    const result = await prisma.$transaction(async (tx) => {
      const before = await tx.householdSurvey.findUnique({ where: { id } });
      if (!before || before.version !== Number(version)) return null;

      const updated = await tx.householdSurvey.updateMany({
        where: { id, version: Number(version) },
        data: dataToUpdate
      });
      if (updated.count === 0) return null;

      const record = await tx.householdSurvey.findUnique({ where: { id } });
      if (!record) return null;
      await writeAuditLog(tx, {
        entityType: 'household',
        entityId: id,
        action: 'updated',
        changedBy: getActorId(req),
        changes: {
          changedFields: Object.keys(dataToUpdate).filter((field) => field !== 'version'),
          before: toAuditSnapshot(before),
          after: toAuditSnapshot(record)
        }
      });
      return record;
    });

    if (!result) {
      return reply.status(409).send({ error: 'Conflict: Survey record was modified by another user. Reload and retry.' });
    }

    invalidateAnalyticsCache();
    invalidateVillageCache();
    return reply.send({ success: true, data: result });
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Household survey update failed');
  }
}

export async function deleteHouseholdSurvey(req: FastifyRequest, reply: FastifyReply) {
  const params = (req.params || {}) as { id: string };
  const { id } = params;
  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const record = await tx.householdSurvey.delete({ where: { id } });
      await writeAuditLog(tx, {
        entityType: 'household', entityId: id, action: 'deleted', changedBy: getActorId(req),
        changes: { reason: 'Administrative household deletion', before: toAuditSnapshot(record), after: null }
      });
      return record;
    });
    invalidateAnalyticsCache();
    invalidateVillageCache();
    return reply.send({ success: true, data: deleted });
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Household survey delete failed');
  }
}

export async function verifyHouseholdRecord(req: FastifyRequest, reply: FastifyReply) {
  const params = (req.params || {}) as { id: string };
  const body = (req.body || {}) as { result?: string };
  const { id } = params;
  const resultStr = body.result || 'सत्यापित';

  try {
    const auditStatus = resultStr === 'सत्यापित' ? 'सत्यापित' : 'फ्लैग';
    const registryStatus = resultStr === 'सत्यापित' ? 'सत्यापित' : resultStr === 'विसंगति मिली' ? 'सुधार आवश्यक' : 'पुनः सत्यापन आवश्यक';

    const updated = await prisma.$transaction(async (tx) => {
      const actorId = getActorId(req);
      const before = await tx.householdSurvey.findUnique({ where: { id } });
      const record = await tx.householdSurvey.update({
        where: { id },
        data: {
          verificationResult: resultStr,
          verifiedBy: actorId,
          verifiedAt: new Date(),
          auditStatus,
          registryStatus
        }
      });
      await writeAuditLog(tx, {
        entityType: 'household', entityId: id, action: 'verified', changedBy: actorId,
        changes: {
          reason: 'Administrative verification',
          before: toAuditSnapshot(before),
          after: toAuditSnapshot(record)
        }
      });
      return record;
    });

    invalidateAnalyticsCache();
    invalidateVillageCache();
    return reply.send({ success: true, data: updated });
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Household verification failed');
  }
}

export async function updateRegistryStatusRecord(req: FastifyRequest, reply: FastifyReply) {
  const params = (req.params || {}) as { id: string };
  const body = (req.body || {}) as { status?: string };
  const { id } = params;
  const statusStr = body.status || 'लंबित';

  try {
    const auditStatus = (statusStr === 'सत्यापित' || statusStr === 'बंद') ? 'सत्यापित' : 'फ्लैग';

    const updated = await prisma.$transaction(async (tx) => {
      const actorId = getActorId(req);
      const before = await tx.householdSurvey.findUnique({ where: { id } });
      const record = await tx.householdSurvey.update({
        where: { id },
        data: { registryStatus: statusStr, auditStatus }
      });
      await writeAuditLog(tx, {
        entityType: 'household', entityId: id, action: 'registry_status_changed', changedBy: actorId,
        changes: {
          reason: 'Administrative registry status change',
          before: toAuditSnapshot(before),
          after: toAuditSnapshot(record)
        }
      });
      return record;
    });

    invalidateAnalyticsCache();
    invalidateVillageCache();
    return reply.send({ success: true, data: updated });
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Household registry update failed');
  }
}

export async function createCorrectionTicketRecord(req: FastifyRequest, reply: FastifyReply) {
  const params = (req.params || {}) as { id: string };
  const body = (req.body || {}) as { reason?: string; note?: string };
  const { id } = params;
  const reasonStr = body.reason || 'दस्तावेज़ सुधार आवश्यक';
  const noteStr = body.note || '';

  try {
    const ticketId = `CT-${Date.now()}`;
    const updated = await prisma.$transaction(async (tx) => {
      const actorId = getActorId(req);
      const before = await tx.householdSurvey.findUnique({ where: { id } });
      const record = await tx.householdSurvey.update({
        where: { id },
        data: {
          correctionTicketId: ticketId,
          correctionReason: reasonStr,
          correctionNote: noteStr,
          correctionCreatedAt: new Date(),
          auditNote: `${reasonStr}${noteStr ? `: ${noteStr}` : ''}`,
          registryStatus: 'सुधार आवश्यक',
          auditStatus: 'फ्लैग'
        }
      });
      await writeAuditLog(tx, {
        entityType: 'household', entityId: id, action: 'correction_ticket_created', changedBy: actorId,
        changes: {
          reason: reasonStr,
          note: noteStr,
          before: toAuditSnapshot(before),
          after: toAuditSnapshot(record)
        }
      });
      return record;
    });

    invalidateAnalyticsCache();
    invalidateVillageCache();
    return reply.send({ success: true, ticketId, data: updated });
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Correction ticket creation failed');
  }
}
