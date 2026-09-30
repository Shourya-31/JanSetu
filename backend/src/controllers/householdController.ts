import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/prisma';
import { withDbRetry } from '../utils/dbRetry';
import { invalidateAnalyticsCache } from './adminController';
import { invalidateVillageCache } from './villageController';

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
        block: answers.block || answers.blockName || 'Narayanpur',
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
        ...answers
      };
    });

    return reply.send(result);
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
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
        // Ensure parent VillageProfile exists to satisfy FK constraint
        await tx.villageProfile.upsert({
          where: { villageName },
          update: {},
          create: {
            villageName,
            block: payloadData.blockName || payloadData.block || 'Narayanpur',
            panchayat: payloadData.panchayatName || payloadData.panchayat || villageName,
            mineDistanceKm: '0 to 5 KM',
            hasPuccaRoad: 'Yes',
            monsoonCutOff: 'No',
            schoolType: 'Primary School',
            hospitalType: 'Sub-Health Centre (SHC)',
            electrification: 'Fully Electrified'
          }
        });

        await tx.$executeRaw`
          SELECT id FROM household_surveys 
          WHERE village_name = ${villageName} AND house_number = ${houseNumber} 
          FOR UPDATE;
        `;

        const survey = await tx.householdSurvey.upsert({
          where: {
            uniqueHousePerVillage: {
              villageName,
              houseNumber
            }
          },
          update: {
            headName: payloadData.headName || 'Household Head',
            mobile: payloadData.mobile || '',
            caste: payloadData.caste || 'Scheduled Tribe (ST)',
            isBPL: payloadData.isBPL || 'Yes',
            totalMembers: Number(payloadData.totalMembers || 1),
            eldersCount: Number(payloadData.eldersCount || 0),
            childrenCount: Number(payloadData.childrenCount || 0),
            unemployedCount: Number(payloadData.unemployedCount || 0),
            incomeSource: payloadData.incomeSource || 'Agriculture',
            missingAadhaar: Number(payloadData.missingAadhaar || 0),
            missingCasteCert: Number(payloadData.missingCasteCert || 0),
            missingAyushman: Number(payloadData.missingAyushman || 0),
            missingVoterId: Number(payloadData.missingVoterId || 0),
            isMiningWorker: payloadData.isMiningWorker || 'No',
            houseType: payloadData.houseType || 'Kaccha House',
            hasToilet: payloadData.hasToilet || 'Yes',
            hasTapWater: payloadData.hasTapWater || 'No',
            surveyAnswers: payloadData,
            version: { increment: 1 }
          },
          create: {
            trackingId,
            villageName,
            houseNumber,
            headName: payloadData.headName || 'Household Head',
            mobile: payloadData.mobile || '',
            caste: payloadData.caste || 'Scheduled Tribe (ST)',
            isBPL: payloadData.isBPL || 'Yes',
            totalMembers: Number(payloadData.totalMembers || 1),
            eldersCount: Number(payloadData.eldersCount || 0),
            childrenCount: Number(payloadData.childrenCount || 0),
            unemployedCount: Number(payloadData.unemployedCount || 0),
            incomeSource: payloadData.incomeSource || 'Agriculture',
            missingAadhaar: Number(payloadData.missingAadhaar || 0),
            missingCasteCert: Number(payloadData.missingCasteCert || 0),
            missingAyushman: Number(payloadData.missingAyushman || 0),
            missingVoterId: Number(payloadData.missingVoterId || 0),
            isMiningWorker: payloadData.isMiningWorker || 'No',
            houseType: payloadData.houseType || 'Kaccha House',
            hasToilet: payloadData.hasToilet || 'Yes',
            hasTapWater: payloadData.hasTapWater || 'No',
            surveyAnswers: payloadData
          }
        });

        return survey;
      });
    });

    invalidateAnalyticsCache();
    invalidateVillageCache();
    return reply.status(200).send({ success: true, data: result });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
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

    if (version !== undefined) {
      dataToUpdate.version = { increment: 1 };
      const updated = await prisma.householdSurvey.updateMany({
        where: { id, version: Number(version) },
        data: dataToUpdate
      });

      if (updated.count === 0) {
        return reply.status(409).send({ error: 'Conflict: Survey record was modified by another user. Reload and retry.' });
      }
    } else {
      await prisma.householdSurvey.update({
        where: { id },
        data: dataToUpdate
      });
    }

    invalidateAnalyticsCache();
    invalidateVillageCache();
    const result = await prisma.householdSurvey.findUnique({ where: { id } });
    return reply.send({ success: true, data: result });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}

export async function deleteHouseholdSurvey(req: FastifyRequest, reply: FastifyReply) {
  const params = (req.params || {}) as { id: string };
  const { id } = params;
  try {
    const deleted = await prisma.householdSurvey.delete({
      where: { id }
    });
    invalidateAnalyticsCache();
    invalidateVillageCache();
    return reply.send({ success: true, data: deleted });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}

export async function verifyHouseholdRecord(req: FastifyRequest, reply: FastifyReply) {
  const params = (req.params || {}) as { id: string };
  const body = (req.body || {}) as { result?: string; actor?: string };
  const { id } = params;
  const resultStr = body.result || 'सत्यापित';
  const actorStr = body.actor || 'Block Auditor';

  try {
    const auditStatus = resultStr === 'सत्यापित' ? 'सत्यापित' : 'फ्लैग';
    const registryStatus = resultStr === 'सत्यापित' ? 'सत्यापित' : resultStr === 'विसंगति मिली' ? 'सुधार आवश्यक' : 'पुनः सत्यापन आवश्यक';

    const updated = await prisma.householdSurvey.update({
      where: { id },
      data: {
        verificationResult: resultStr,
        verifiedBy: actorStr,
        verifiedAt: new Date(),
        auditStatus,
        registryStatus
      }
    });

    invalidateAnalyticsCache();
    invalidateVillageCache();
    return reply.send({ success: true, data: updated });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}

export async function updateRegistryStatusRecord(req: FastifyRequest, reply: FastifyReply) {
  const params = (req.params || {}) as { id: string };
  const body = (req.body || {}) as { status?: string };
  const { id } = params;
  const statusStr = body.status || 'लंबित';

  try {
    const auditStatus = (statusStr === 'सत्यापित' || statusStr === 'बंद') ? 'सत्यापित' : 'फ्लैग';

    const updated = await prisma.householdSurvey.update({
      where: { id },
      data: {
        registryStatus: statusStr,
        auditStatus
      }
    });

    invalidateAnalyticsCache();
    invalidateVillageCache();
    return reply.send({ success: true, data: updated });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}

export async function createCorrectionTicketRecord(req: FastifyRequest, reply: FastifyReply) {
  const params = (req.params || {}) as { id: string };
  const body = (req.body || {}) as { reason?: string; note?: string; actor?: string };
  const { id } = params;
  const reasonStr = body.reason || 'दस्तावेज़ सुधार आवश्यक';
  const noteStr = body.note || '';

  try {
    const ticketId = `CT-${Date.now()}`;
    const updated = await prisma.householdSurvey.update({
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

    invalidateAnalyticsCache();
    invalidateVillageCache();
    return reply.send({ success: true, ticketId, data: updated });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}
