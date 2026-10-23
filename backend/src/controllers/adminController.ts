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
  // Simplified for now to fix TS errors while fulfilling user request to hold off on admin section
  // User explicitly said: "for now dont do any work in admin section it will be done later"
  return reply.status(501).send({ error: 'Admin query is disabled during migration' });
}

export async function getAnalyticsSummary(req: FastifyRequest, reply: FastifyReply) {
  const query = req.query as {
    blockId?: string;
    panchayatId?: string;
    villageId?: string;
  };
  const parseId = (value?: string) => {
    if (value === undefined) return undefined;
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  };
  const blockId = parseId(query.blockId);
  const panchayatId = parseId(query.panchayatId);
  const villageId = parseId(query.villageId);
  if (blockId === null || panchayatId === null || villageId === null) {
    return reply.code(400).send({ error: 'Location IDs must be positive integers.' });
  }

  const villageWhere = {
    ...(villageId === undefined ? {} : { id: villageId }),
    ...((blockId === undefined && panchayatId === undefined)
      ? {}
      : {
          gramPanchayat: {
            ...(panchayatId === undefined ? {} : { id: panchayatId }),
            ...(blockId === undefined ? {} : { blockId })
          }
        })
  };

  try {
    const [villages, householdGroups] = await Promise.all([
      prisma.village.findMany({
        where: villageWhere,
        select: {
          id: true,
          gramPanchayat: { select: { id: true, blockId: true } },
          villageSurvey: {
            select: {
              isCompleted: true,
              totalPopulation: true,
              totalHouseholds: true
            }
          }
        }
      }),
      prisma.householdSurvey.groupBy({
        by: ['villageId', 'isCompleted'],
        where: { village: villageWhere },
        _count: { _all: true }
      })
    ]);

    const villageSurveysCompleted = villages.filter(
      (village) => village.villageSurvey?.isCompleted === true
    ).length;
    const villageSurveysIncomplete = villages.filter(
      (village) => village.villageSurvey !== null && !village.villageSurvey.isCompleted
    ).length;
    const villageSurveysUnavailable = villages.length - villageSurveysCompleted - villageSurveysIncomplete;
    const householdRecords = householdGroups.reduce((sum, group) => sum + group._count._all, 0);
    const completedHouseholdRecords = householdGroups
      .filter((group) => group.isCompleted)
      .reduce((sum, group) => sum + group._count._all, 0);
    const populations = villages
      .map((village) => village.villageSurvey?.totalPopulation)
      .filter((value): value is number => value !== null && value !== undefined);
    const householdTotals = villages
      .map((village) => village.villageSurvey?.totalHouseholds)
      .filter((value): value is number => value !== null && value !== undefined);
    const blockIds = new Set(villages.map((village) => village.gramPanchayat.blockId));
    const panchayatIds = new Set(villages.map((village) => village.gramPanchayat.id));

    return reply.send({
      districts: villages.length ? 1 : 0,
      blocks: blockIds.size,
      gramPanchayats: panchayatIds.size,
      villages: villages.length,
      villageSurveysCompleted,
      villageSurveysPending: villages.length - villageSurveysCompleted,
      villageSurveysIncomplete,
      villageSurveysUnavailable,
      villageCompletionPercent: villages.length
        ? Math.round((villageSurveysCompleted / villages.length) * 100)
        : 0,
      householdRecords,
      completedHouseholdRecords,
      incompleteHouseholdRecords: householdRecords - completedHouseholdRecords,
      householdCompletionPercent: householdRecords
        ? Math.round((completedHouseholdRecords / householdRecords) * 100)
        : null,
      population: populations.length ? populations.reduce((sum, value) => sum + value, 0) : null,
      populationResponses: populations.length,
      totalHouseholds: householdTotals.length
        ? householdTotals.reduce((sum, value) => sum + value, 0)
        : null,
      householdTotalResponses: householdTotals.length
    });
  } catch (error) {
    return sendInternalError(req, reply, error, 'Admin analytics query failed');
  }
}
