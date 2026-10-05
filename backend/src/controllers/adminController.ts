import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/prisma';
import { sendInternalError } from '../utils/httpErrors';

let cachedAnalytics: any = null;
let cacheExpiry = 0;

export function invalidateAnalyticsCache() {
  cachedAnalytics = null;
  cacheExpiry = 0;
}

export async function queryAdminHouseholds(req: FastifyRequest, reply: FastifyReply) {
  const filter = (req.body || {}) as {
    block?: string;
    panchayat?: string;
    village?: string;
    isBPL?: string;
    caste?: string;
    isMiningWorker?: string;
    hasMissingDocs?: boolean;
    hasUnemployed?: boolean;
    auditStatus?: string;
    registryStatus?: string;
    hasTicket?: boolean;
    houseNumber?: number | string;
    searchQuery?: string;
  };
  
  const where: any = {};
  const andConditions: any[] = [];

  if (filter.block) {
    andConditions.push({
      OR: [
        { surveyAnswers: { path: ['block'], equals: filter.block } },
        { surveyAnswers: { path: ['blockName'], equals: filter.block } }
      ]
    });
  }
  if (filter.panchayat) {
    andConditions.push({
      OR: [
        { surveyAnswers: { path: ['panchayat'], equals: filter.panchayat } },
        { surveyAnswers: { path: ['panchayatName'], equals: filter.panchayat } }
      ]
    });
  }

  if (filter.village) {
    where.villageName = filter.village;
  }
  if (filter.isBPL) {
    if (filter.isBPL === 'Yes' || filter.isBPL === 'हां') {
      where.isBPL = { in: ['Yes', 'हां'] };
    } else if (filter.isBPL === 'No' || filter.isBPL === 'नहीं') {
      where.isBPL = { in: ['No', 'नहीं'] };
    } else {
      where.isBPL = filter.isBPL;
    }
  }
  if (filter.caste) {
    where.caste = filter.caste;
  }
  if (filter.isMiningWorker) {
    if (filter.isMiningWorker === 'Yes' || filter.isMiningWorker === 'हां') {
      where.isMiningWorker = { in: ['Yes', 'हां'] };
    } else if (filter.isMiningWorker === 'No' || filter.isMiningWorker === 'नहीं') {
      where.isMiningWorker = { in: ['No', 'नहीं'] };
    } else {
      where.isMiningWorker = filter.isMiningWorker;
    }
  }
  if (filter.auditStatus && filter.auditStatus !== 'सभी' && filter.auditStatus !== 'All') {
    if (filter.auditStatus === 'Verified' || filter.auditStatus === 'सत्यापित') {
      where.auditStatus = { in: ['Verified', 'सत्यापित'] };
    } else if (filter.auditStatus === 'Pending' || filter.auditStatus === 'लंबित') {
      where.auditStatus = { in: ['Pending', 'लंबित'] };
    } else if (filter.auditStatus === 'Flagged' || filter.auditStatus === 'फ्लैग') {
      where.auditStatus = { in: ['Flagged', 'फ्लैग'] };
    } else {
      where.auditStatus = filter.auditStatus;
    }
  }
  if (filter.registryStatus && filter.registryStatus !== 'सभी' && filter.registryStatus !== 'All') {
    if (filter.registryStatus === 'Verified' || filter.registryStatus === 'सत्यापित') {
      where.registryStatus = { in: ['Verified', 'सत्यापित'] };
    } else if (filter.registryStatus === 'Pending' || filter.registryStatus === 'लंबित') {
      where.registryStatus = { in: ['Pending', 'लंबित'] };
    } else if (filter.registryStatus === 'Needs Correction' || filter.registryStatus === 'सुधार आवश्यक') {
      where.registryStatus = { in: ['Needs Correction', 'सुधार आवश्यक'] };
    } else if (filter.registryStatus === 'Re-verification Needed' || filter.registryStatus === 'पुनः सत्यापन आवश्यक') {
      where.registryStatus = { in: ['Re-verification Needed', 'पुनः सत्यापन आवश्यक'] };
    } else {
      where.registryStatus = filter.registryStatus;
    }
  }
  if (filter.hasTicket) {
    where.correctionTicketId = { not: null };
  }
  if (filter.houseNumber) {
    where.houseNumber = Number(filter.houseNumber);
  }
  if (filter.hasMissingDocs) {
    where.OR = [
      { missingAadhaar: { gt: 0 } },
      { missingAyushman: { gt: 0 } },
      { missingCasteCert: { gt: 0 } },
      { missingVoterId: { gt: 0 } }
    ];
  }
  if (filter.hasUnemployed) {
    where.unemployedCount = { gt: 0 };
  }
  if (filter.searchQuery && filter.searchQuery.trim().length > 0) {
    const q = filter.searchQuery.trim();
    const isNumeric = /^\d+$/.test(q);
    if (isNumeric) {
      const numVal = Number(q);
      const orConditions: any[] = [{ mobile: { contains: q } }, { trackingId: { contains: q, mode: 'insensitive' } }];
      if (!isNaN(numVal) && numVal < 2147483647) {
        orConditions.push({ houseNumber: numVal });
      }
      andConditions.push({ OR: orConditions });
    } else {
      andConditions.push({
        OR: [
            { headName: { contains: q, mode: 'insensitive' } },
            { trackingId: { contains: q, mode: 'insensitive' } },
            { villageName: { contains: q, mode: 'insensitive' } },
            { mobile: { contains: q } }
        ]
      });
    }
  }

  if (andConditions.length > 0) where.AND = andConditions;

  try {
    const households = await prisma.householdSurvey.findMany({
      where,
      take: 500,
      orderBy: { submittedAt: 'desc' }
    });

    const results = households.map((h) => {
      const answers = (h.surveyAnswers as Record<string, any>) || {};
      return {
        villageName: h.villageName,
        houseNumber: h.houseNumber,
        data: {
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
          submittedAt: h.submittedAt ? h.submittedAt.toISOString() : new Date().toISOString(),
          ...answers
        }
      };
    });

    return reply.send(results);
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Admin household query failed');
  }
}

export async function getAnalyticsSummary(req: FastifyRequest, reply: FastifyReply) {
  const now = Date.now();
  if (cachedAnalytics && now < cacheExpiry) {
    return reply.send(cachedAnalytics);
  }

  try {
    const fetchSummary = async () => {
      try {
        const mvRows = await prisma.$queryRaw<any[]>`
          SELECT 
            COALESCE(SUM("totalHouseholds"), 0)::int AS total_households,
            COALESCE(SUM("totalPopulation"), 0)::int AS total_population,
            COALESCE(SUM("bplCount"), 0)::int AS bpl_count,
            COALESCE(SUM("missingAadhaarTotal"), 0)::int AS missing_aadhaar_total,
            COALESCE(SUM("missingAyushmanTotal"), 0)::int AS missing_ayushman_total,
            COALESCE(SUM("unemployedYouthTotal"), 0)::int AS unemployed_youth_total
          FROM mv_district_cluster_analytics;
        `;
        return mvRows[0];
      } catch {
        const [agg, bplCount] = await Promise.all([
          prisma.householdSurvey.aggregate({
            _sum: {
              totalMembers: true,
              missingAadhaar: true,
              missingAyushman: true,
              unemployedCount: true
            },
            _count: { id: true }
          }),
          prisma.householdSurvey.count({ where: { isBPL: 'Yes' } })
        ]);

        return {
          total_households: agg._count.id || 0,
          total_population: agg._sum.totalMembers || 0,
          bpl_count: bplCount || 0,
          missing_aadhaar_total: agg._sum.missingAadhaar || 0,
          missing_ayushman_total: agg._sum.missingAyushman || 0,
          unemployed_youth_total: agg._sum.unemployedCount || 0
        };
      }
    };

    const [totalVillages, summary, villageProfiles] = await Promise.all([
      prisma.villageProfile.count(),
      fetchSummary(),
      prisma.villageProfile.findMany({ select: { gapMatrix: true } })
    ]);

    const totalHhd = summary.total_households || 0;
    const bplHhd = summary.bpl_count || 0;
    const infrastructureGapTotal = villageProfiles.reduce((total, village) => {
      const gapMatrix = village.gapMatrix as Record<string, unknown>;
      return total + Object.values(gapMatrix || {}).reduce<number>((villageTotal, entry) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return villageTotal;
        const gap = Number((entry as { gap?: unknown }).gap);
        return Number.isFinite(gap) && gap > 0 ? villageTotal + gap : villageTotal;
      }, 0);
    }, 0);

    cachedAnalytics = {
      totalVillages,
      totalHouseholds: totalHhd,
      totalPopulation: summary.total_population || 0,
      bplPercentage: totalHhd > 0 ? Math.round((bplHhd / totalHhd) * 100) : 0,
      missingAadhaarTotal: summary.missing_aadhaar_total,
      missingAyushmanTotal: summary.missing_ayushman_total,
      unemployedYouthTotal: summary.unemployed_youth_total,
      infrastructureGapTotal
    };

    cacheExpiry = now + 60000;
    return reply.send(cachedAnalytics);
  } catch (err: any) {
    return sendInternalError(req, reply, err, 'Analytics summary query failed');
  }
}
