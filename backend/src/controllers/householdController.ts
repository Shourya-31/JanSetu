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
    const village = await prisma.village.findFirst({ where: { nameHindi: villageName } });
    if (!village) return reply.send({});

    const households = await prisma.householdSurvey.findMany({
      where: { villageId: village.id },
      orderBy: { houseNumber: 'asc' }
    });

    const result: Record<number, any> = {};
    households.forEach((h) => {
      // Return flat fields expecting the old surveyAnswers shape basically
      result[h.houseNumber] = {
        id: h.id,
        trackingId: h.trackingId,
        houseNumber: h.houseNumber,
        villageName: village.nameHindi,
        headName: h.headName,
        mobile: h.mobile,
        caste: h.caste,
        isBPL: h.isBpl,
        totalMembers: 1, // hardcoded or add to schema if needed, but not in frontend form
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
        surveyAnswers: {
           // Provide fallback for any fields frontend might read from surveyAnswers
        }
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
        SELECT pg_advisory_xact_lock(hashtext(${villageName})::int, -1::int);
      `;
      
      const village = await tx.village.findFirst({ where: { nameHindi: villageName } });
      if (!village) throw new Error('Village not found');

      const created = await tx.householdSurvey.createManyAndReturn({
        data: Array.from({ length: count }, (_, index) => {
          const houseNumber = index + 1;
          return {
            trackingId: `DMFT-HHD-${randomUUID()}`,
            villageId: village.id,
            houseNumber,
            headName: '',
            mobile: '',
            caste: '',
            isBpl: '',
            eldersCount: 0,
            childrenCount: 0,
            unemployedMembers: 0,
            mainIncomeSource: '',
            noAadhaarMembers: 0,
            noCasteCertMembers: 0,
            noAyushmanMembers: 0,
            noVoterIdMembers: 0,
            miningEmployment: '',
            houseType: '',
            toiletStatus: '',
            tapWaterConnection: '',
            createdBy: actorId
          };
        }),
        skipDuplicates: true,
        select: { id: true, trackingId: true, houseNumber: true, version: true }
      });

      if (created.length > 0) {
        await tx.surveyAuditLog.createMany({
          data: created.map((record) => ({
            entityType: 'household',
            entityId: record.id,
            action: 'created',
            changedBy: actorId,
            changes: { reason: 'Household survey slot initialized' } as Prisma.InputJsonValue
          }))
        });
      }

      return tx.householdSurvey.findMany({
        where: { villageId: village.id, houseNumber: { lte: count } },
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
          SELECT pg_advisory_xact_lock(hashtext(${villageName})::int, ${houseNumber}::int);
        `;
        const actorId = getActorId(req);
        
        const village = await tx.village.findFirst({ where: { nameHindi: villageName } });
        if (!village) throw new Error('Village not found');
        
        const existing = await tx.householdSurvey.findUnique({
          where: { uq_house_per_village: { villageId: village.id, houseNumber } }
        });

        const survey = await tx.householdSurvey.upsert({
          where: {
            uq_house_per_village: {
              villageId: village.id,
              houseNumber
            }
          },
          update: {
            headName: payloadData.headName || '',
            mobile: payloadData.mobile || '',
            caste: payloadData.caste || '',
            isBpl: payloadData.isBpl || payloadData.isBPL || '',
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
            otherAssistance: payloadData.otherAssistance || '',
            deathInLastYear: payloadData.deathInLastYear || '',
            deathCertificateReceived: payloadData.deathCertificateReceived || '',
            pmGaribKalyanRation: payloadData.pmGaribKalyanRation || '',
            childrenWithoutBirthCert: Number(payloadData.childrenWithoutBirthCertificate || 0),
            vaccinationStatus: payloadData.vaccinationStatus || '',
            anganwadiMeal: payloadData.anganwadiMeal || '',
            childrenSchoolStatus: payloadData.childrenSchoolStatus || '',
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
            headName: payloadData.headName || '',
            mobile: payloadData.mobile || '',
            caste: payloadData.caste || '',
            isBpl: payloadData.isBpl || payloadData.isBPL || '',
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
            otherAssistance: payloadData.otherAssistance || '',
            deathInLastYear: payloadData.deathInLastYear || '',
            deathCertificateReceived: payloadData.deathCertificateReceived || '',
            pmGaribKalyanRation: payloadData.pmGaribKalyanRation || '',
            childrenWithoutBirthCert: Number(payloadData.childrenWithoutBirthCertificate || 0),
            vaccinationStatus: payloadData.vaccinationStatus || '',
            anganwadiMeal: payloadData.anganwadiMeal || '',
            childrenSchoolStatus: payloadData.childrenSchoolStatus || '',
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
