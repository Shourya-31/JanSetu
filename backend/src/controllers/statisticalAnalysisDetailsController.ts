import { FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { VILLAGE_AFFECTED_STATUS } from '../utils/villageAffectedStatus';
import { withErrorContext } from '../utils/errors';

type DetailsQuery = {
  scope: 'village' | 'household';
  blockId?: number;
  blockIds?: number[];
  category: 'ALL' | 'DIRECT' | 'INDIRECT' | 'UNAFFECTED' | 'UNCLASSIFIED';
  metric: 'block' | 'total' | 'villages' | 'completed' | 'completion' | 'households' | 'householdCompleted' | 'average' | 'other';
  page: number;
  pageSize: number;
};

function categoryFilter(category: DetailsQuery['category']): Prisma.VillageWhereInput {
  if (category === 'DIRECT') {
    return { affectedStatus: { in: [VILLAGE_AFFECTED_STATUS.DIRECT, VILLAGE_AFFECTED_STATUS.BOTH] } };
  }
  if (category === 'INDIRECT') {
    return { affectedStatus: VILLAGE_AFFECTED_STATUS.INDIRECT };
  }
  if (category === 'UNAFFECTED') {
    return { affectedStatus: VILLAGE_AFFECTED_STATUS.UNAFFECTED };
  }
  if (category === 'UNCLASSIFIED') {
    return {
      affectedStatus: {
        notIn: [
          VILLAGE_AFFECTED_STATUS.DIRECT,
          VILLAGE_AFFECTED_STATUS.BOTH,
          VILLAGE_AFFECTED_STATUS.INDIRECT,
          VILLAGE_AFFECTED_STATUS.UNAFFECTED
        ]
      }
    };
  }
  return {};
}

export async function getStatisticalAnalysisDetails(
  request: FastifyRequest<{ Querystring: DetailsQuery }>,
  reply: FastifyReply
) {
  const { scope, blockId, blockIds, category, metric, page, pageSize } = request.query;
  const skip = (page - 1) * pageSize;
  const selectedBlockIds = blockId === undefined ? blockIds : [blockId];
  const baseWhere: Prisma.VillageWhereInput = {
    ...categoryFilter(category),
    ...(selectedBlockIds?.length ? { gramPanchayat: { is: { blockId: { in: selectedBlockIds } } } } : {})
  };

  try {
    const blocks = selectedBlockIds?.length
      ? await prisma.block.findMany({
        where: { id: { in: selectedBlockIds } },
        select: { id: true, nameEnglish: true }
      })
      : [];
    if (selectedBlockIds?.length && blocks.length !== new Set(selectedBlockIds).size) {
      return reply.code(404).send({ error: { message: 'Block not found.' } });
    }
    const block = blockId === undefined ? null : blocks.find((item) => item.id === blockId) ?? null;

    const eligibleVillages = await prisma.village.count({ where: baseWhere });
    const villageWhere: Prisma.VillageWhereInput = scope === 'village' && metric === 'completed'
      ? { ...baseWhere, villageSurvey: { is: { isCompleted: true } } }
      : scope === 'village' && metric === 'other'
        ? { ...baseWhere, OR: [{ villageSurvey: null }, { villageSurvey: { is: { isCompleted: false } } }] }
        : scope === 'household' && (metric === 'households' || metric === 'average')
          ? { ...baseWhere, households: { some: {} } }
          : scope === 'household' && metric === 'householdCompleted'
            ? { ...baseWhere, households: { some: { isCompleted: true } } }
            : baseWhere;

    const villageCount = await prisma.village.count({ where: villageWhere });
    const completedVillageCount = await prisma.village.count({
      where: { ...baseWhere, villageSurvey: { is: { isCompleted: true } } }
    });

    if (scope === 'village') {
      const villages = await prisma.village.findMany({
        where: villageWhere,
        orderBy: [{ gramPanchayatId: 'asc' }, { id: 'asc' }],
        skip,
        take: pageSize,
        select: {
          id: true,
          nameHindi: true,
          nameEnglish: true,
          affectedStatus: true,
          villageSurvey: { select: { isCompleted: true } },
          gramPanchayat: {
            select: {
              nameHindi: true,
              nameEnglish: true,
              block: { select: { id: true, nameEnglish: true } }
            }
          }
        }
      });

      return reply.send({
        scope,
        filter: { blockId: block?.id ?? null, blockName: block?.nameEnglish ?? null, category, metric },
        totals: {
          eligibleVillages,
          completedVillages: completedVillageCount,
          householdCount: 0,
          completedHouseholdCount: 0,
          metricCount: villageCount,
          completionPercent: eligibleVillages ? completedVillageCount / eligibleVillages * 100 : null
        },
        records: villages.map((village) => ({
          villageId: village.id,
          villageName: village.nameEnglish,
          villageNameHindi: village.nameHindi,
          gramPanchayatName: village.gramPanchayat.nameEnglish,
          gramPanchayatNameHindi: village.gramPanchayat.nameHindi,
          blockId: village.gramPanchayat.block.id,
          blockName: village.gramPanchayat.block.nameEnglish,
          affectedStatus: village.affectedStatus,
          surveyCompleted: village.villageSurvey?.isCompleted === true,
          completionPercent: village.villageSurvey?.isCompleted === true ? 100 : 0
        })),
        pagination: { page, pageSize, totalRecords: villageCount, totalPages: Math.ceil(villageCount / pageSize) }
      });
    }

    const householdWhere: Prisma.HouseholdSurveyWhereInput = { village: { is: baseWhere } };
    const [householdGroups, villagesWithoutHouseholds] = await Promise.all([
      prisma.householdSurvey.groupBy({
        by: ['villageId', 'isCompleted'],
        where: householdWhere,
        _count: { _all: true }
      }),
      prisma.village.count({ where: { ...baseWhere, households: { none: {} } } })
    ]);
    const countsByVillage = new Map<number, { total: number; completed: number }>();
    for (const group of householdGroups) {
      const counts = countsByVillage.get(group.villageId) ?? { total: 0, completed: 0 };
      counts.total += group._count._all;
      if (group.isCompleted) counts.completed += group._count._all;
      countsByVillage.set(group.villageId, counts);
    }
    const householdCount = householdGroups.reduce((total, group) => total + group._count._all, 0);
    const completedHouseholdCount = householdGroups.reduce(
      (total, group) => total + (group.isCompleted ? group._count._all : 0),
      0
    );
    const villagesWithHouseholds = countsByVillage.size;
    const averagePercent = villagesWithHouseholds
      ? [...countsByVillage.values()].reduce((sum, counts) => sum + counts.completed / counts.total * 100, 0) / villagesWithHouseholds
      : null;

    const householdSelection = metric === 'householdCompleted'
      ? { where: { isCompleted: true }, orderBy: { houseNumber: 'asc' as const } }
      : { orderBy: { houseNumber: 'asc' as const } };
    const villages = await prisma.village.findMany({
      where: villageWhere,
      orderBy: [{ gramPanchayatId: 'asc' }, { id: 'asc' }],
      skip,
      take: pageSize,
      select: {
        id: true,
        nameHindi: true,
        nameEnglish: true,
        affectedStatus: true,
        gramPanchayat: {
          select: {
            nameHindi: true,
            nameEnglish: true,
            block: { select: { id: true, nameEnglish: true } }
          }
        },
        households: {
          ...householdSelection,
          select: { id: true, houseNumber: true, isCompleted: true }
        }
      }
    });
    const records = villages.map((village) => {
      const counts = countsByVillage.get(village.id) ?? { total: 0, completed: 0 };
      return {
        villageId: village.id,
        villageName: village.nameEnglish,
        villageNameHindi: village.nameHindi,
        gramPanchayatName: village.gramPanchayat.nameEnglish,
        gramPanchayatNameHindi: village.gramPanchayat.nameHindi,
        blockId: village.gramPanchayat.block.id,
        blockName: village.gramPanchayat.block.nameEnglish,
        affectedStatus: village.affectedStatus,
        householdCount: counts.total,
        completedHouseholdCount: counts.completed,
        villageCompletionPercent: counts.total ? counts.completed / counts.total * 100 : null,
        households: village.households
      };
    });
    const metricCount = metric === 'villages' || metric === 'total' || metric === 'block'
      ? eligibleVillages
      : metric === 'householdCompleted'
        ? completedHouseholdCount
        : metric === 'average'
          ? villagesWithHouseholds
        : householdCount;

    return reply.send({
      scope,
      filter: { blockId: block?.id ?? null, blockName: block?.nameEnglish ?? null, category, metric },
      totals: {
        eligibleVillages,
        completedVillages: completedVillageCount,
        householdCount,
        completedHouseholdCount,
        villagesWithoutHouseholds,
        villagesWithHouseholds,
        averagePercent,
        metricCount,
        completionPercent: householdCount ? completedHouseholdCount / householdCount * 100 : null
      },
      records,
      pagination: { page, pageSize, totalRecords: villageCount, totalPages: Math.ceil(villageCount / pageSize) }
    });
  } catch (error) {
    throw withErrorContext(error, {
      operation: 'admin.statistical_analysis.details',
      stage: 'database_query'
    });
  }
}
