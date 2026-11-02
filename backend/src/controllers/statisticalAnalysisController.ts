import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../config/prisma';
import officialVillageSourceData from '../data/officialVillageAffectedAreas2026.json';
import { calculateStatisticalBlockMetrics } from '../utils/statisticalAnalysis';
import { withErrorContext } from '../utils/errors';

const officialSource = officialVillageSourceData as {
  sourceFileName: string;
  entries: { officialStatus: string }[];
};

function getOfficialSourceSummary() {
  const counts = { directOnly: 0, both: 0, indirectOnly: 0, unaffected: 0 };
  for (const entry of officialSource.entries) {
    if (entry.officialStatus === 'प्रत्यक्ष प्रभावित') counts.directOnly += 1;
    else if (entry.officialStatus === 'प्रत्यक्ष एवं अप्रत्यक्ष दोनों') counts.both += 1;
    else if (entry.officialStatus === 'अप्रत्यक्ष प्रभावित') counts.indirectOnly += 1;
    else if (entry.officialStatus === 'अप्रभावित') counts.unaffected += 1;
  }
  return {
    sourceFile: officialSource.sourceFileName,
    totalEntries: officialSource.entries.length,
    affectedEntries: counts.directOnly + counts.both + counts.indirectOnly,
    counts
  };
}

export async function getStatisticalAnalysis(_req: FastifyRequest, reply: FastifyReply) {
  try {
    const blocks = await prisma.block.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        nameEnglish: true,
        gramPanchayats: {
          select: {
            villages: {
              select: {
                id: true,
                affectedStatus: true,
                villageSurvey: { select: { isCompleted: true } },
                households: { select: { isCompleted: true } }
              }
            }
          }
        }
      }
    });
    const refreshedAt = new Date().toISOString();

    return reply.send({
      officialSource: getOfficialSourceSummary(),
      blocks: blocks.map((block) => {
        const villages = block.gramPanchayats.flatMap((panchayat) => panchayat.villages);
        const summary = calculateStatisticalBlockMetrics(villages);
        const isOrcha = /^orch(?:a|ha)\b/i.test(block.nameEnglish.trim());
        const isNarayanpur = /^narayanpur\b/i.test(block.nameEnglish.trim());

        return {
          blockId: block.id,
          blockName: isOrcha ? 'Orcha' : isNarayanpur ? 'Narayanpur' : block.nameEnglish,
          isStale: false,
          refreshAttempts: 0,
          refreshFailed: false,
          refreshedAt,
          sourceUpdatedAt: null,
          summary: {
            totalVillages: summary.totalVillages,
            unclassifiedVillages: summary.unclassifiedVillages,
            directVillageCount: summary.directVillageCount,
            directVillageSurveysCompleted: summary.directVillageSurveysCompleted,
            indirectVillageCount: summary.indirectVillageCount,
            indirectVillageSurveysCompleted: summary.indirectVillageSurveysCompleted,
            unaffectedVillageCount: summary.totalVillages
              - summary.unclassifiedVillages
              - summary.directVillageCount
              - summary.indirectVillageCount,
            directHouseholdInput: summary.directHouseholdInput,
            directHouseholdCompleted: summary.directHouseholdCompleted,
            directVillageHouseholdCompletionPercentSum: summary.directVillageHouseholdCompletionPercentSum,
            directVillageHouseholdCompletionPercentCount: summary.directVillageHouseholdCompletionPercentCount,
            indirectHouseholdInput: summary.indirectHouseholdInput,
            indirectHouseholdCompleted: summary.indirectHouseholdCompleted,
            indirectVillageHouseholdCompletionPercentSum: summary.indirectVillageHouseholdCompletionPercentSum,
            indirectVillageHouseholdCompletionPercentCount: summary.indirectVillageHouseholdCompletionPercentCount
          }
        };
      })
    });
  } catch (error) {
    throw withErrorContext(error, {
      operation: 'admin.statistical_analysis.query',
      stage: 'database_query'
    });
  }
}
