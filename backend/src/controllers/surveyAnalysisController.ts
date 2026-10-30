import { FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { withErrorContext } from '../utils/errors';

type AnalysisQuery = {
  blockId?: string;
  panchayatId?: string;
  villageId?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'all' | 'completed' | 'incomplete' | 'pending';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

function parseId(value: string | undefined): number | undefined | null {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseScope(query: AnalysisQuery) {
  const blockId = parseId(query.blockId);
  const panchayatId = parseId(query.panchayatId);
  const villageId = parseId(query.villageId);
  if (blockId === null || panchayatId === null || villageId === null) return null;

  return {
    blockId,
    panchayatId,
    villageId,
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 25,
    search: query.search?.trim(),
    status: query.status ?? 'all',
    sortBy: query.sortBy,
    sortOrder: query.sortOrder ?? 'asc'
  };
}

function villageStatusWhere(status: AnalysisQuery['status']): Prisma.VillageWhereInput {
  if (status === 'completed') return { villageSurvey: { is: { isCompleted: true } } };
  if (status === 'incomplete') return { villageSurvey: { is: { isCompleted: false } } };
  if (status === 'pending') return { villageSurvey: { is: null } };
  return {};
}

export async function getVillageSurveyAnalysis(req: FastifyRequest, reply: FastifyReply) {
  const scope = parseScope(req.query as AnalysisQuery);
  if (!scope) return reply.code(400).send({ error: 'Location IDs must be positive integers.' });
  const { blockId, panchayatId, villageId, page, pageSize, search, status, sortBy, sortOrder } = scope;

  const baseWhere: Prisma.VillageWhereInput = {
    ...(villageId ? { id: villageId } : {}),
    gramPanchayat: {
      ...(blockId ? { blockId } : {}),
      ...(panchayatId ? { id: panchayatId } : {})
    },
    ...(search ? {
      OR: [
        { nameHindi: { contains: search, mode: 'insensitive' } },
        { nameEnglish: { contains: search, mode: 'insensitive' } }
      ]
    } : {})
  };
  const where: Prisma.VillageWhereInput = { ...baseWhere, ...villageStatusWhere(status) };
  const orderBy: Prisma.VillageOrderByWithRelationInput[] = sortBy === 'affectedStatus'
    ? [{ affectedStatus: sortOrder }, { nameHindi: 'asc' }, { id: 'asc' }]
    : [{ nameHindi: sortOrder }, { id: 'asc' }];

  try {
    const [records, total, scopeTotal, completed, incomplete, pending] = await Promise.all([
      prisma.village.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          villageSurvey: true,
          gramPanchayat: {
            include: { block: true }
          }
        }
      }),
      prisma.village.count({ where }),
      prisma.village.count({ where: baseWhere }),
      prisma.village.count({ where: { ...baseWhere, ...villageStatusWhere('completed') } }),
      prisma.village.count({ where: { ...baseWhere, ...villageStatusWhere('incomplete') } }),
      prisma.village.count({ where: { ...baseWhere, ...villageStatusWhere('pending') } })
    ]);

    const serializedRecords = records.map((village) => {
      const survey = village.villageSurvey;
      const surveyData = survey?.surveyData && typeof survey.surveyData === 'object' && !Array.isArray(survey.surveyData)
        ? survey.surveyData as Record<string, unknown>
        : {};
      const answers = survey ? {
        ...surveyData,
        ...survey,
        villagePhotos: survey.villagePhotos
      } : {};

      return {
        ...answers,
        id: village.id,
        villageId: village.id,
        villageName: village.nameHindi,
        villageNameEnglish: village.nameEnglish,
        blockId: village.gramPanchayat.block.id,
        blockName: village.gramPanchayat.block.nameHindi,
        panchayatId: village.gramPanchayat.id,
        panchayatName: village.gramPanchayat.nameHindi,
        affectedStatus: village.affectedStatus,
        isSurveyFilled: village.isSurveyFilled,
        isCompleted: survey?.isCompleted ?? false,
        surveyStatus: survey?.isCompleted ? 'completed' : survey ? 'incomplete' : 'pending',
        progress: survey?.isCompleted ? 100 : survey?.progress ?? 0,
        data: answers,
        formData: answers,
        surveyUpdatedAt: survey?.updatedAt.toISOString() ?? null
      };
    });

    return reply.send({
      records: serializedRecords,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      stats: {
        total: scopeTotal,
        completed,
        incomplete,
        pending,
        completionPercent: scopeTotal ? Math.round((completed / scopeTotal) * 100) : 0
      }
    });
  } catch (error) {
    throw withErrorContext(error, { operation: 'admin.village_survey_analysis.query', stage: 'database_query' });
  }
}

export async function getHouseholdSurveyAnalysis(req: FastifyRequest, reply: FastifyReply) {
  const scope = parseScope(req.query as AnalysisQuery);
  if (!scope) return reply.code(400).send({ error: 'Location IDs must be positive integers.' });
  const { blockId, panchayatId, villageId, page, pageSize, search, status, sortBy, sortOrder } = scope;

  const villageWhere: Prisma.VillageWhereInput = {
    ...(villageId ? { id: villageId } : {}),
    gramPanchayat: {
      ...(blockId ? { blockId } : {}),
      ...(panchayatId ? { id: panchayatId } : {})
    }
  };
  const searchWhere: Prisma.HouseholdSurveyWhereInput = search ? {
    OR: [
      { headName: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search } },
      ...(Number.isSafeInteger(Number(search)) && Number(search) > 0
        ? [{ houseNumber: Number(search) }]
        : []),
      {
        village: {
          is: {
            OR: [
              { nameHindi: { contains: search, mode: 'insensitive' } },
              { nameEnglish: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      }
    ]
  } : {};
  const baseWhere: Prisma.HouseholdSurveyWhereInput = {
    village: villageWhere,
    ...searchWhere
  };
  const where: Prisma.HouseholdSurveyWhereInput = {
    ...baseWhere,
    ...(status === 'completed' ? { isCompleted: true } : {}),
    ...(status === 'incomplete' || status === 'pending' ? { isCompleted: false } : {})
  };
  const orderBy: Prisma.HouseholdSurveyOrderByWithRelationInput[] =
    sortBy === 'headName'
      ? [{ headName: sortOrder }, { villageId: 'asc' }, { houseNumber: 'asc' }]
      : sortBy === 'submittedAt'
        ? [{ submittedAt: sortOrder }, { id: 'asc' }]
        : sortBy === 'status'
          ? [{ isCompleted: sortOrder }, { villageId: 'asc' }, { houseNumber: 'asc' }]
          : [{ houseNumber: sortOrder }, { villageId: 'asc' }];

  try {
    const [records, total, scopeTotal, completed, incomplete] = await Promise.all([
      prisma.householdSurvey.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          isCompleted: true,
          houseNumber: true,
          villageId: true,
          headName: true,
          mobile: true,
          surveyDate: true,
          surveyorName: true,
          caste: true,
          isBpl: true,
          totalMembers: true,
          eldersCount: true,
          childrenCount: true,
          womenCount: true,
          rationCard: true,
          noAadhaarMembers: true,
          aadhaarEkyc: true,
          noCasteCertMembers: true,
          noAyushmanMembers: true,
          noVoterIdMembers: true,
          mnregaJobCard: true,
          noShramikCardMembers: true,
          janDhanAccount: true,
          bankName: true,
          kcc: true,
          forestRightsPatta: true,
          marriageCertificate: true,
          jsy: true,
          pmmvy: true,
          mahtariVandana: true,
          widowPension: true,
          disabilityPension: true,
          needsAssistiveDevice: true,
          assistanceTypes: true,
          otherAssistance: true,
          deathInLastYear: true,
          deathCertificateReceived: true,
          pmGaribKalyanRation: true,
          childrenWithoutBirthCert: true,
          vaccinationStatus: true,
          anganwadiMeal: true,
          childrenSchoolStatus: true,
          schoolNotGoingReason: true,
          otherSchoolReason: true,
          unemployedMembers: true,
          pmKisan: true,
          miningEmployment: true,
          annualIncome: true,
          mainIncomeSource: true,
          livestockSource: true,
          otherLivestockSource: true,
          animalEmployment: true,
          houseType: true,
          housingSchemeBenefit: true,
          toiletStatus: true,
          tapWaterConnection: true,
          drinkingWaterSource: true,
          electricityConnection: true,
          solarEnergy: true,
          familyDisease: true,
          freeMedicines: true,
          shgMember: true,
          priorityNeed1: true,
          priorityNeed2: true,
          priorityNeed3: true,
          eligibleSchemeNotReceived: true,
          schemeBenefitName: true,
          submittedAt: true,
          village: {
            select: {
              id: true,
              nameHindi: true,
              gramPanchayat: {
                select: {
                  id: true,
                  nameHindi: true,
                  block: { select: { id: true, nameHindi: true } }
                }
              }
            }
          }
        }
      }),
      prisma.householdSurvey.count({ where }),
      prisma.householdSurvey.count({ where: baseWhere }),
      prisma.householdSurvey.count({ where: { ...baseWhere, isCompleted: true } }),
      prisma.householdSurvey.count({ where: { ...baseWhere, isCompleted: false } })
    ]);

    const serializedRecords = records.map((household) => ({
      ...household,
      mobileNumber: household.mobile,
      villageName: household.village.nameHindi,
      panchayatName: household.village.gramPanchayat.nameHindi,
      blockName: household.village.gramPanchayat.block.nameHindi,
      completed: household.isCompleted,
      elderly: household.eldersCount,
      children: household.childrenCount,
      women: household.womenCount,
      noCasteCertificateMembers: household.noCasteCertMembers,
      marriagecertificate: household.marriageCertificate,
      childrenWithoutBirthCertificate: household.childrenWithoutBirthCert
    }));

    return reply.send({
      records: serializedRecords,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      stats: {
        total: scopeTotal,
        completed,
        incomplete,
        pending: incomplete,
        completionPercent: scopeTotal ? Math.round((completed / scopeTotal) * 100) : 0
      }
    });
  } catch (error) {
    throw withErrorContext(error, { operation: 'admin.household_survey_analysis.query', stage: 'database_query' });
  }
}
