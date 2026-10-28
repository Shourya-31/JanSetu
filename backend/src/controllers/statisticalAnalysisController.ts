import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../config/prisma';
import officialVillageSourceData from '../data/officialVillageAffectedAreas2026.json';
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
        nameHindi: true,
        nameEnglish: true,
        statisticalAnalysisSummary: true,
        statisticalAnalysisRefreshQueue: {
          select: { attempts: true, lastError: true }
        }
      }
    });

    return reply.send({
      officialSource: getOfficialSourceSummary(),
      blocks: blocks.map((block) => {
        const summary = block.statisticalAnalysisSummary;
        const refreshQueue = block.statisticalAnalysisRefreshQueue;
        const isOrcha = /^orch(?:a|ha)\b/i.test(block.nameEnglish.trim());
        const isNarayanpur = /^narayanpur\b/i.test(block.nameEnglish.trim());

        return {
          blockId: block.id,
          blockName: isOrcha ? 'Orcha' : isNarayanpur ? 'Narayanpur' : block.nameEnglish,
          isStale: !summary || summary.isStale || Boolean(refreshQueue),
          refreshAttempts: refreshQueue?.attempts ?? 0,
          refreshFailed: Boolean(refreshQueue?.lastError),
          refreshedAt: summary?.refreshedAt?.toISOString() ?? null,
          sourceUpdatedAt: summary?.sourceUpdatedAt?.toISOString() ?? null,
          summary: summary ? {
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
          } : null
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
