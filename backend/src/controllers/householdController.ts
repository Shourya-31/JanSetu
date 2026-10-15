import { FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { withDbRetry } from '../utils/dbRetry';
import { invalidateAnalyticsCache } from './adminController';
import { invalidateVillageCache } from './villageController';
import { getActorId, toAuditSnapshot, writeAuditLog } from '../utils/auditLog';
import { sendInternalError } from '../utils/httpErrors';
import { toHouseholdSurveyAnswers } from '../utils/householdSurvey';
import { hasSavedHouseholdAnswers, readExpectedHouseholdCount, withExpectedHouseholdCount } from '../utils/householdCount';

function validVillageId(value: unknown): number | undefined {
  const id = typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')
    ? Number(value)
    : Number.NaN;
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

function householdVillageWhere(input: { villageName?: string; villageId?: number; block?: string; panchayat?: string }) {
  if (input.villageId !== undefined) return { id: input.villageId };
  return {
    nameHindi: input.villageName,
    ...(input.panchayat ? {
      gramPanchayat: {
        nameHindi: input.panchayat,
        ...(input.block ? { block: { nameHindi: input.block } } : {})
      }
    } : {})
  };
}

export async function getHouseholdSurveys(req: FastifyRequest, reply: FastifyReply) {
  const query = (req.query || {}) as { villageName?: string; villageId?: number | string; block?: string; panchayat?: string };
  const { villageName, block, panchayat } = query;
  const villageId = validVillageId(query.villageId);
  if (villageId === undefined && !villageName) {
    return reply.status(400).send({ error: 'villageId or villageName query parameter is required' });
  }

  try {
    const village = villageId !== undefined
      ? await prisma.village.findUnique({
        where: { id: Number(villageId) },
        include: { villageSurvey: { select: { surveyData: true } } }
      })
      : await prisma.village.findFirst({
        where: householdVillageWhere({ villageName, block, panchayat }),
        include: { villageSurvey: { select: { surveyData: true } } }
      });
    if (!village) return reply.send({});

    const households = await prisma.householdSurvey.findMany({
      where: { villageId: village.id },
      orderBy: { houseNumber: 'asc' }
    });

    const householdsByNumber: Record<number, any> = {};
    households.forEach((h) => {
      // Return flat fields expecting the old surveyAnswers shape basically
      householdsByNumber[h.houseNumber] = {
        id: h.id,
        trackingId: h.trackingId,
        houseNumber: h.houseNumber,
        villageName: village.nameHindi,
        headName: h.headName,
        isCompleted: h.isCompleted,
        mobile: h.mobile,
        caste: h.caste,
        isBPL: h.isBpl,
        totalMembers: h.totalMembers,
        eldersCount: h.eldersCount,
        childrenCount: h.childrenCount,
        unemployedCount: h.unemployedMembers,
        incomeSource: h.mainIncomeSource,
        missingAadhaar: h.noAadhaarMembers,
        missingCasteCert: h.noCasteCertMembers,
        missingAyushman: h.noAyushmanMembers,
        missingVoterId: h.noVoterIdMembers,
        isMiningWorker: h.miningEmployment,
        houseType: h.houseType,
        hasToilet: h.toiletStatus,
        hasTapWater: h.tapWaterConnection,
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
        surveyAnswers: toHouseholdSurveyAnswers(h)
      };
    });

    const savedCount = readExpectedHouseholdCount(village.villageSurvey?.surveyData);
    const householdCount = savedCount ?? (households.at(-1)?.houseNumber ?? 0);
    return reply.send({ householdCount, households: householdsByNumber });
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Household survey query failed');
  }
}

export async function createHouseholdSlots(req: FastifyRequest, reply: FastifyReply) {
  const { villageName, block, panchayat, count } = req.body as {
    villageName?: string;
    villageId?: number | string | null;
    block: string;
    panchayat: string;
    count: number;
  };
  const villageId = validVillageId((req.body as { villageId?: unknown }).villageId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const village = villageId !== undefined
        ? await tx.village.findUnique({ where: { id: Number(villageId) } })
        : await tx.village.findFirst({
          where: householdVillageWhere({ villageName, block, panchayat })
        });
      if (!village) throw new Error('Village not found');

      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(${village.id}::bigint);
      `;

      const villageSurvey = await tx.villageSurvey.findUnique({
        where: { villageId: village.id },
        select: { surveyData: true }
      });
      const savedHouseholds = await tx.householdSurvey.findMany({
        where: { villageId: village.id },
        orderBy: { houseNumber: 'asc' }
      });
      const currentCount = readExpectedHouseholdCount(villageSurvey?.surveyData)
        ?? (savedHouseholds.at(-1)?.houseNumber ?? 0);
      if (count < currentCount && savedHouseholds.some(
        (household) => household.houseNumber > count && hasSavedHouseholdAnswers(household)
      )) {
        return { conflict: true as const };
      }

      const surveyData = withExpectedHouseholdCount(villageSurvey?.surveyData, count);
      await tx.villageSurvey.upsert({
        where: { villageId: village.id },
        create: {
          village: { connect: { id: village.id } },
          surveyData: surveyData as Prisma.InputJsonValue
        },
        update: { surveyData: surveyData as Prisma.InputJsonValue }
      });

      const households = Object.fromEntries(savedHouseholds.map((household) => [
        household.houseNumber,
        {
          id: household.id,
          trackingId: household.trackingId,
          houseNumber: household.houseNumber,
          villageName: village.nameHindi,
          headName: household.headName,
          isCompleted: household.isCompleted,
          version: household.version,
          auditStatus: household.auditStatus,
          registryStatus: household.registryStatus,
          surveyAnswers: toHouseholdSurveyAnswers(household)
        }
      ]));
      return { conflict: false as const, householdCount: count, households };
    });

    if (result.conflict) {
      return reply.status(409).send({
        error: 'Household count cannot be reduced because saved answers exist above the requested count.'
      });
    }

    invalidateAnalyticsCache();
    invalidateVillageCache();
    return reply.status(200).send({ success: true, ...result });
  } catch (error) {
    return sendInternalError(req, reply, error, 'Household survey slots initialization failed');
  }
}

export async function saveHouseholdSurvey(req: FastifyRequest, reply: FastifyReply) {
  const body = (req.body || {}) as any;
  const villageName = body.villageName || (body.data && body.data.villageName);
  const villageId = validVillageId(body.villageId ?? (body.data && body.data.villageId));
  const block = body.block || (body.data && body.data.block);
  const panchayat = body.panchayat || (body.data && body.data.panchayat);
  const houseNumber = body.houseNumber !== undefined ? Number(body.houseNumber) : (body.data && body.data.houseNumber !== undefined ? Number(body.data.houseNumber) : undefined);
  const rawPayloadData = body.data || body;
  let payloadData = rawPayloadData;

  if ((villageId === undefined && !villageName) || houseNumber === undefined || !payloadData) {
    return reply.status(400).send({ error: 'villageId or villageName, houseNumber, and data payload are required' });
  }

  try {
    const trackingId = payloadData.trackingId || `DMFT-HHD-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = await withDbRetry(async () => {
      return await prisma.$transaction(async (tx) => {
        const actorId = getActorId(req);
        
        const village = villageId !== undefined
          ? await tx.village.findUnique({ where: { id: Number(villageId) } })
          : await tx.village.findFirst({ where: householdVillageWhere({ villageName, block, panchayat }) });
        if (!village) throw new Error('Village not found');

        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock_shared(${village.id}::bigint);
        `;
        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(${village.id}::int, ${houseNumber}::int);
        `;
        const villageSurvey = await tx.villageSurvey.findUnique({
          where: { villageId: village.id },
          select: { surveyData: true }
        });
        const expectedHouseholdCount = readExpectedHouseholdCount(villageSurvey?.surveyData);
        if (expectedHouseholdCount !== null && houseNumber > expectedHouseholdCount) {
          return { conflict: true as const };
        }
        
        const existing = await tx.householdSurvey.findUnique({
          where: { uq_house_per_village: { villageId: village.id, houseNumber } }
        });
        payloadData = existing
          ? { ...toHouseholdSurveyAnswers(existing), ...rawPayloadData }
          : rawPayloadData;

        const survey = await tx.householdSurvey.upsert({
          where: {
            uq_house_per_village: {
              villageId: village.id,
              houseNumber
            }
          },
          update: {
            headName: payloadData.headName || '',
            isCompleted: payloadData.isCompleted || false,
            completedSections: payloadData.completedSections || 0,
            mobile: payloadData.mobile || '',
            surveyDate: payloadData.surveyDate || '',
            surveyorName: payloadData.surveyorName || '',
            caste: payloadData.caste || '',
            isBpl: payloadData.isBpl || payloadData.isBPL || '',
            totalMembers: Number(payloadData.totalMembers || 0),
            eldersCount: parseInt(String(payloadData.elderly || payloadData.eldersCount || 0).replace(/[^0-9]/g,"")) || 0,
            childrenCount: parseInt(String(payloadData.children || payloadData.childrenCount || 0).replace(/[^0-9]/g,"")) || 0,
            womenCount: parseInt(String(payloadData.women || payloadData.womenCount || 0).replace(/[^0-9]/g,"")) || 0,
            rationCard: payloadData.rationCard || '',
            noAadhaarMembers: Number(payloadData.noAadhaarMembers || 0),
            aadhaarEkyc: payloadData.aadhaarEkyc || '',
            noCasteCertMembers: parseInt(String(payloadData.noCasteCertificateMembers || payloadData.noCasteCertMembers || 0).replace(/[^0-9]/g,"")) || 0,
            noAyushmanMembers: Number(payloadData.noAyushmanMembers || 0),
            noVoterIdMembers: Number(payloadData.noVoterIdMembers || 0),
            mnregaJobCard: payloadData.mnregaJobCard || '',
            noShramikCardMembers: Number(payloadData.noShramikCardMembers || 0),
            janDhanAccount: payloadData.janDhanAccount || '',
            bankName: payloadData.bankName || '',
            kcc: payloadData.kcc || '',
            forestRightsPatta: payloadData.forestRightsPatta || '',
            marriageCertificate: payloadData.marriagecertificate || payloadData.marriageCertificate || '',
            jsy: payloadData.jsy || '',
            pmmvy: payloadData.pmmvy || '',
            mahtariVandana: payloadData.mahtariVandana || '',
            widowPension: payloadData.widowPension || '',
            disabilityPension: payloadData.disabilityPension || '',
            needsAssistiveDevice: payloadData.needsAssistiveDevice || '',
            assistanceTypes: payloadData.assistanceTypes || [],
            otherAssistance: payloadData.otherAssistance || '',
            deathInLastYear: payloadData.deathInLastYear || '',
            deathCertificateReceived: payloadData.deathCertificateReceived || '',
            pmGaribKalyanRation: payloadData.pmGaribKalyanRation || '',
            childrenWithoutBirthCert: Number(payloadData.childrenWithoutBirthCertificate || 0),
            vaccinationStatus: payloadData.vaccinationStatus || '',
            anganwadiMeal: payloadData.anganwadiMeal || '',
            childrenSchoolStatus: payloadData.childrenSchoolStatus || '',
            schoolNotGoingReason: payloadData.schoolNotGoingReason || [],
            otherSchoolReason: payloadData.otherSchoolReason || '',
            unemployedMembers: parseInt(String(payloadData.unemployedMembers || payloadData.unemployedCount || 0).replace(/[^0-9]/g,"")) || 0,
            pmKisan: payloadData.pmKisan || '',
            miningEmployment: payloadData.miningEmployment || payloadData.isMiningWorker || '',
            annualIncome: payloadData.annualIncome ? Number(payloadData.annualIncome) : null,
            mainIncomeSource: payloadData.mainIncomeSource || payloadData.incomeSource || '',
            livestockSource: payloadData.livestockSource || '',
            otherLivestockSource: payloadData.otherLivestockSource || '',
            animalEmployment: payloadData.animalEmployment || '',
            houseType: payloadData.houseType || '',
            housingSchemeBenefit: payloadData.housingSchemeBenefit || '',
            toiletStatus: payloadData.toiletStatus || payloadData.hasToilet || '',
            tapWaterConnection: payloadData.tapWaterConnection || payloadData.hasTapWater || '',
            drinkingWaterSource: payloadData.drinkingWaterSource || '',
            electricityConnection: payloadData.electricityConnection || '',
            solarEnergy: payloadData.solarEnergy || '',
            familyDisease: payloadData.familyDisease || '',
            freeMedicines: payloadData.freeMedicines || '',
            shgMember: payloadData.shgMember || '',
            priorityNeed1: payloadData.priorityNeed1 || '',
            priorityNeed2: payloadData.priorityNeed2 || '',
            priorityNeed3: payloadData.priorityNeed3 || '',
            eligibleSchemeNotReceived: payloadData.eligibleSchemeNotReceived || '',
            schemeBenefitName: payloadData.schemeBenefitName || '',
            version: { increment: 1 }
          },
          create: {
            trackingId,
            villageId: village.id,
            houseNumber,
            createdBy: actorId,
            isCompleted: payloadData.isCompleted || false,
            completedSections: payloadData.completedSections || 0,
            headName: payloadData.headName || '',
            mobile: payloadData.mobile || '',
            surveyDate: payloadData.surveyDate || '',
            surveyorName: payloadData.surveyorName || '',
            caste: payloadData.caste || '',
            isBpl: payloadData.isBpl || payloadData.isBPL || '',
            totalMembers: Number(payloadData.totalMembers || 0),
            eldersCount: parseInt(String(payloadData.elderly || payloadData.eldersCount || 0).replace(/[^0-9]/g,"")) || 0,
            childrenCount: parseInt(String(payloadData.children || payloadData.childrenCount || 0).replace(/[^0-9]/g,"")) || 0,
            womenCount: parseInt(String(payloadData.women || payloadData.womenCount || 0).replace(/[^0-9]/g,"")) || 0,
            rationCard: payloadData.rationCard || '',
            noAadhaarMembers: Number(payloadData.noAadhaarMembers || 0),
            aadhaarEkyc: payloadData.aadhaarEkyc || '',
            noCasteCertMembers: parseInt(String(payloadData.noCasteCertificateMembers || payloadData.noCasteCertMembers || 0).replace(/[^0-9]/g,"")) || 0,
            noAyushmanMembers: Number(payloadData.noAyushmanMembers || 0),
            noVoterIdMembers: Number(payloadData.noVoterIdMembers || 0),
            mnregaJobCard: payloadData.mnregaJobCard || '',
            noShramikCardMembers: Number(payloadData.noShramikCardMembers || 0),
            janDhanAccount: payloadData.janDhanAccount || '',
            bankName: payloadData.bankName || '',
            kcc: payloadData.kcc || '',
            forestRightsPatta: payloadData.forestRightsPatta || '',
            marriageCertificate: payloadData.marriagecertificate || payloadData.marriageCertificate || '',
            jsy: payloadData.jsy || '',
            pmmvy: payloadData.pmmvy || '',
            mahtariVandana: payloadData.mahtariVandana || '',
            widowPension: payloadData.widowPension || '',
            disabilityPension: payloadData.disabilityPension || '',
            needsAssistiveDevice: payloadData.needsAssistiveDevice || '',
            assistanceTypes: payloadData.assistanceTypes || [],
            otherAssistance: payloadData.otherAssistance || '',
            deathInLastYear: payloadData.deathInLastYear || '',
            deathCertificateReceived: payloadData.deathCertificateReceived || '',
            pmGaribKalyanRation: payloadData.pmGaribKalyanRation || '',
            childrenWithoutBirthCert: Number(payloadData.childrenWithoutBirthCertificate || 0),
            vaccinationStatus: payloadData.vaccinationStatus || '',
            anganwadiMeal: payloadData.anganwadiMeal || '',
            childrenSchoolStatus: payloadData.childrenSchoolStatus || '',
            schoolNotGoingReason: payloadData.schoolNotGoingReason || [],
            otherSchoolReason: payloadData.otherSchoolReason || '',
            unemployedMembers: parseInt(String(payloadData.unemployedMembers || payloadData.unemployedCount || 0).replace(/[^0-9]/g,"")) || 0,
            pmKisan: payloadData.pmKisan || '',
            miningEmployment: payloadData.miningEmployment || payloadData.isMiningWorker || '',
            annualIncome: payloadData.annualIncome ? Number(payloadData.annualIncome) : null,
            mainIncomeSource: payloadData.mainIncomeSource || payloadData.incomeSource || '',
            livestockSource: payloadData.livestockSource || '',
            otherLivestockSource: payloadData.otherLivestockSource || '',
            animalEmployment: payloadData.animalEmployment || '',
            houseType: payloadData.houseType || '',
            housingSchemeBenefit: payloadData.housingSchemeBenefit || '',
            toiletStatus: payloadData.toiletStatus || payloadData.hasToilet || '',
            tapWaterConnection: payloadData.tapWaterConnection || payloadData.hasTapWater || '',
            drinkingWaterSource: payloadData.drinkingWaterSource || '',
            electricityConnection: payloadData.electricityConnection || '',
            solarEnergy: payloadData.solarEnergy || '',
            familyDisease: payloadData.familyDisease || '',
            freeMedicines: payloadData.freeMedicines || '',
            shgMember: payloadData.shgMember || '',
            priorityNeed1: payloadData.priorityNeed1 || '',
            priorityNeed2: payloadData.priorityNeed2 || '',
            priorityNeed3: payloadData.priorityNeed3 || '',
            eligibleSchemeNotReceived: payloadData.eligibleSchemeNotReceived || '',
            schemeBenefitName: payloadData.schemeBenefitName || ''
          }
        });

        await writeAuditLog(tx, {
          entityType: 'household',
          entityId: survey.id,
          action: existing ? 'updated' : 'created',
          changedBy: actorId,
          changes: {
            reason: 'Household survey submission',
            changedFields: Object.keys(rawPayloadData),
            before: toAuditSnapshot(existing),
            after: toAuditSnapshot(survey)
          }
        });
        return survey;
      });
    });

    if ('conflict' in result) {
      return reply.status(409).send({
        error: 'This household number is above the saved household count. Update the count before saving.'
      });
    }

    invalidateAnalyticsCache();
    invalidateVillageCache();
    return reply.status(200).send({ success: true, data: result });
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Household survey save failed');
  }
}

export async function patchHouseholdSurvey(req: FastifyRequest, reply: FastifyReply) {
  // Simplified patch since frontend primarily uses saveHouseholdSurvey
  return reply.status(501).send({ error: 'Patch not fully supported yet in new schema' });
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
  return reply.status(501).send({ error: 'Not implemented' });
}

export async function updateRegistryStatusRecord(req: FastifyRequest, reply: FastifyReply) {
  return reply.status(501).send({ error: 'Not implemented' });
}

export async function createCorrectionTicketRecord(req: FastifyRequest, reply: FastifyReply) {
  return reply.status(501).send({ error: 'Not implemented' });
}
