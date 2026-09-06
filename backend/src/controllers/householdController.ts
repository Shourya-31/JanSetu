import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/prisma';
import { withDbRetry } from '../utils/dbRetry';

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
      result[h.houseNumber] = {
        id: h.id,
        trackingId: h.trackingId,
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
        version: h.version,
        submittedAt: h.submittedAt,
        ...((h.surveyAnswers as Record<string, any>) || {})
      };
    });

    return reply.send(result);
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}

export async function saveHouseholdSurvey(req: FastifyRequest, reply: FastifyReply) {
  const body = (req.body || {}) as { villageName?: string; houseNumber?: number; data?: any };
  const { villageName, houseNumber, data } = body;

  if (!villageName || houseNumber === undefined || !data) {
    return reply.status(400).send({ error: 'villageName, houseNumber, and data are required' });
  }

  try {
    const trackingId = data.trackingId || `DMFT-HHD-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = await withDbRetry(async () => {
      return await prisma.$transaction(async (tx) => {
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
            headName: data.headName || 'Household Head',
            mobile: data.mobile || '',
            caste: data.caste || 'Scheduled Tribe (ST)',
            isBPL: data.isBPL || 'Yes',
            totalMembers: data.totalMembers || 1,
            eldersCount: data.eldersCount || 0,
            childrenCount: data.childrenCount || 0,
            unemployedCount: data.unemployedCount || 0,
            incomeSource: data.incomeSource || 'Agriculture',
            missingAadhaar: data.missingAadhaar || 0,
            missingCasteCert: data.missingCasteCert || 0,
            missingAyushman: data.missingAyushman || 0,
            missingVoterId: data.missingVoterId || 0,
            isMiningWorker: data.isMiningWorker || 'No',
            houseType: data.houseType || 'Kaccha House',
            hasToilet: data.hasToilet || 'Yes',
            hasTapWater: data.hasTapWater || 'No',
            surveyAnswers: data,
            version: { increment: 1 }
          },
          create: {
            trackingId,
            villageName,
            houseNumber,
            headName: data.headName || 'Household Head',
            mobile: data.mobile || '',
            caste: data.caste || 'Scheduled Tribe (ST)',
            isBPL: data.isBPL || 'Yes',
            totalMembers: data.totalMembers || 1,
            eldersCount: data.eldersCount || 0,
            childrenCount: data.childrenCount || 0,
            unemployedCount: data.unemployedCount || 0,
            incomeSource: data.incomeSource || 'Agriculture',
            missingAadhaar: data.missingAadhaar || 0,
            missingCasteCert: data.missingCasteCert || 0,
            missingAyushman: data.missingAyushman || 0,
            missingVoterId: data.missingVoterId || 0,
            isMiningWorker: data.isMiningWorker || 'No',
            houseType: data.houseType || 'Kaccha House',
            hasToilet: data.hasToilet || 'Yes',
            hasTapWater: data.hasTapWater || 'No',
            surveyAnswers: data
          }
        });

        return survey;
      });
    });

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

  if (!version) {
    return reply.status(400).send({ error: 'Record version is required for optimistic locking update' });
  }

  try {
    const updated = await prisma.householdSurvey.updateMany({
      where: { id, version },
      data: {
        headName: updates.headName !== undefined ? updates.headName : undefined,
        mobile: updates.mobile !== undefined ? updates.mobile : undefined,
        missingAadhaar: updates.missingAadhaar !== undefined ? updates.missingAadhaar : undefined,
        missingAyushman: updates.missingAyushman !== undefined ? updates.missingAyushman : undefined,
        version: { increment: 1 }
      }
    });

    if (updated.count === 0) {
      return reply.status(409).send({ error: 'Conflict: Survey record was modified by another surveyor. Reload and retry.' });
    }

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
    return reply.send({ success: true, data: deleted });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}
