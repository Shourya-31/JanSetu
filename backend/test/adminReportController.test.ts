import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import type { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../src/config/prisma';
import { apiRoutes } from '../src/routes/api';
import { getAnalyticsSummary } from '../src/controllers/adminController';
import { getAdminGramStats, getAdminSurveys } from '../src/controllers/adminReportController';
import { getAdminHierarchy } from '../src/controllers/hierarchyController';

function replaceMethod(target: object, key: string, value: (...args: never[]) => unknown): () => void {
  const previous = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(target, key, { configurable: true, writable: true, value });
  return () => {
    if (previous) Object.defineProperty(target, key, previous);
    else Reflect.deleteProperty(target, key);
  };
}

test('admin household report returns animal-employment answers exactly as saved', async (t) => {
  const village = {
    id: 3,
    nameHindi: 'परीक्षण गाँव',
    nameEnglish: 'Test Village',
    villageSurvey: null,
    gramPanchayat: {
      id: 5,
      nameEnglish: 'Test Panchayat',
      block: { id: 9, nameEnglish: 'Test Block' }
    }
  };
  const restoreVillages = replaceMethod(
    prisma.village,
    'findMany',
    (async () => [village]) as (...args: never[]) => unknown
  );
  const restoreHouseholds = replaceMethod(
    prisma.householdSurvey,
    'findMany',
    (async () => ['हाँ', 'नहीं', 'पात्रता नहीं'].map((animalEmployment, index) => ({
      id: `household-${index + 1}`,
      villageId: village.id,
      houseNumber: index + 1,
      submittedAt: new Date('2026-10-15T00:00:00.000Z'),
      isCompleted: false,
      animalEmployment,
      village
    }))) as (...args: never[]) => unknown
  );
  t.after(restoreVillages);
  t.after(restoreHouseholds);

  let result: unknown;
  const reply = {
    send(payload: unknown) {
      result = payload;
      return payload;
    },
    code() {
      return this;
    }
  } as unknown as FastifyReply;

  await getAdminSurveys({
    query: { blockId: '9' }
  } as FastifyRequest, reply);

  const payload = result as {
    householdSurveys: { answers: { animalEmployment: string } }[];
  };
  assert.deepEqual(
    payload.householdSurveys.map((household) => household.answers.animalEmployment),
    ['हाँ', 'नहीं', 'पात्रता नहीं']
  );
});

test('admin analytics aggregates distinct villages and explicit completion statuses by database scope', async (t) => {
  const villages = [
    {
      id: 1,
      gramPanchayat: { id: 10, blockId: 2 },
      villageSurvey: { isCompleted: true, totalPopulation: 120, totalHouseholds: 30 }
    },
    {
      id: 2,
      gramPanchayat: { id: 10, blockId: 2 },
      villageSurvey: { isCompleted: false, totalPopulation: null, totalHouseholds: 20 }
    },
    {
      id: 3,
      gramPanchayat: { id: 11, blockId: 4 },
      villageSurvey: null
    }
  ];
  let villageQuery: unknown;
  let householdQuery: unknown;
  const restoreVillages = replaceMethod(
    prisma.village,
    'findMany',
    (async (args: { where: unknown }) => {
      villageQuery = args.where;
      return villages.filter((village) => {
        const where = args.where as { id?: number; gramPanchayat?: { id?: number; blockId?: number } };
        return (!where.id || where.id === village.id)
          && (!where.gramPanchayat?.id || where.gramPanchayat.id === village.gramPanchayat.id)
          && (!where.gramPanchayat?.blockId || where.gramPanchayat.blockId === village.gramPanchayat.blockId);
      });
    }) as (...args: never[]) => unknown
  );
  const restoreHouseholds = replaceMethod(
    prisma.householdSurvey,
    'groupBy',
    (async (args: { where: { village: unknown } }) => {
      householdQuery = args.where;
      const where = args.where.village as { id?: number; gramPanchayat?: { id?: number; blockId?: number } };
      if (where.id === 1) return [{ villageId: 1, isCompleted: true, _count: { _all: 2 } }];
      return [
        { villageId: 1, isCompleted: true, _count: { _all: 2 } },
        { villageId: 2, isCompleted: false, _count: { _all: 1 } }
      ];
    }) as (...args: never[]) => unknown
  );
  t.after(restoreVillages);
  t.after(restoreHouseholds);

  let result: unknown;
  const reply = {
    send(payload: unknown) { result = payload; return payload; },
    code() { return this; }
  } as unknown as FastifyReply;
  await getAnalyticsSummary({ query: {} } as FastifyRequest, reply);
  const all = result as Record<string, number | null>;
  assert.equal(all.districts, 1);
  assert.equal(all.blocks, 2);
  assert.equal(all.gramPanchayats, 2);
  assert.equal(all.villages, 3);
  assert.equal(all.villageSurveysCompleted, 1);
  assert.equal(all.villageSurveysPending, 2);
  assert.equal(all.villageSurveysIncomplete, 1);
  assert.equal(all.villageSurveysUnavailable, 1);
  assert.equal(all.villageCompletionPercent, 33);
  assert.equal(all.householdRecords, 3);
  assert.equal(all.completedHouseholdRecords, 2);
  assert.equal(all.incompleteHouseholdRecords, 1);
  assert.equal(all.householdCompletionPercent, 67);
  assert.equal(all.population, 120);
  assert.equal(all.totalHouseholds, 50);

  await getAnalyticsSummary({
    query: { blockId: '2', panchayatId: '10', villageId: '1' }
  } as FastifyRequest, reply);
  assert.deepEqual(villageQuery, { id: 1, gramPanchayat: { id: 10, blockId: 2 } });
  assert.deepEqual(householdQuery, {
    village: { id: 1, gramPanchayat: { id: 10, blockId: 2 } }
  });
  const selected = result as Record<string, number | null>;
  assert.equal(selected.villages, 1);
  assert.equal(selected.villageCompletionPercent, 100);
  assert.equal(selected.householdRecords, 2);
});

test('admin analytics returns safe empty percentages for an empty scope', async (t) => {
  const restoreVillages = replaceMethod(
    prisma.village,
    'findMany',
    (async () => []) as (...args: never[]) => unknown
  );
  const restoreHouseholds = replaceMethod(
    prisma.householdSurvey,
    'groupBy',
    (async () => []) as (...args: never[]) => unknown
  );
  t.after(restoreVillages);
  t.after(restoreHouseholds);

  let result: unknown;
  const reply = {
    send(payload: unknown) { result = payload; return payload; },
    code() { return this; }
  } as unknown as FastifyReply;
  await getAnalyticsSummary({ query: { blockId: '999' } } as FastifyRequest, reply);
  const summary = result as Record<string, number | null>;
  assert.equal(summary.villageCompletionPercent, 0);
  assert.equal(summary.householdCompletionPercent, null);
  assert.equal(Number.isFinite(summary.villageCompletionPercent), true);
});

test('admin gram statistics include both-affected villages in both categories and exclude unaffected villages', async (t) => {
  const block = {
    id: 1,
    nameHindi: 'ब्लॉक',
    nameEnglish: 'Block',
    totalVillages: 0,
    totalHouseholds: 40,
    householdsFilled: 12,
    villageSurveysFilled: 0,
    gramPanchayats: [{
      id: 2,
      nameHindi: 'पंचायत',
      nameEnglish: 'Panchayat',
      totalVillages: 0,
      totalHouseholds: 40,
      householdsFilled: 12,
      villageSurveysFilled: 0,
      villages: [
        { id: 1, nameHindi: 'प्रत्यक्ष', affectedStatus: 'Direct Affected', isSurveyFilled: false, villageSurvey: { isCompleted: true }, totalHouseholds: 10, householdsFilled: 2 },
        { id: 2, nameHindi: 'दोनों', affectedStatus: 'Direct and Indirect Both', isSurveyFilled: false, villageSurvey: { isCompleted: false }, totalHouseholds: 10, householdsFilled: 3 },
        { id: 3, nameHindi: 'अप्रत्यक्ष', affectedStatus: 'Indirect Affected', isSurveyFilled: false, villageSurvey: null, totalHouseholds: 10, householdsFilled: 4 },
        { id: 4, nameHindi: 'अप्रभावित', affectedStatus: 'Unaffected', isSurveyFilled: false, villageSurvey: { isCompleted: true }, totalHouseholds: 10, householdsFilled: 3 }
      ]
    }]
  };
  const restoreBlocks = replaceMethod(
    prisma.block,
    'findMany',
    (async () => [block]) as (...args: never[]) => unknown
  );
  t.after(restoreBlocks);

  let result: unknown;
  const reply = {
    send(payload: unknown) { result = payload; return payload; },
    code() { return this; }
  } as unknown as FastifyReply;
  await getAdminGramStats({} as FastifyRequest, reply);

  const payload = result as {
    blocks: {
      totalVillages: number;
      directAffectedVillages: number;
      indirectAffectedVillages: number;
      unaffectedVillages: number;
      directAffectedVillagesSurveyFilled: number;
      indirectAffectedVillagesSurveyFilled: number;
      panchayats: {
        villages: {
          affectedStatus: string;
          isDirectAffected: boolean;
          isIndirectAffected: boolean;
        }[];
      }[];
    }[];
    summary: {
      totalVillages: number;
      directAffectedVillages: number;
      indirectAffectedVillages: number;
      unaffectedVillages: number;
    };
  };
  const blockStats = payload.blocks[0];
  assert.equal(blockStats.totalVillages, 4);
  assert.equal(blockStats.directAffectedVillages, 2);
  assert.equal(blockStats.indirectAffectedVillages, 2);
  assert.equal(blockStats.unaffectedVillages, 1);
  assert.equal(blockStats.directAffectedVillagesSurveyFilled, 1);
  assert.equal(blockStats.indirectAffectedVillagesSurveyFilled, 0);
  assert.deepEqual(
    blockStats.panchayats[0].villages.map((village) => [village.isDirectAffected, village.isIndirectAffected]),
    [[true, false], [true, true], [false, true], [false, false]]
  );
  assert.deepEqual(
    {
      totalVillages: payload.summary.totalVillages,
      directAffectedVillages: payload.summary.directAffectedVillages,
      indirectAffectedVillages: payload.summary.indirectAffectedVillages,
      unaffectedVillages: payload.summary.unaffectedVillages
    },
    { totalVillages: 4, directAffectedVillages: 2, indirectAffectedVillages: 2, unaffectedVillages: 1 }
  );
});

test('statistical analysis endpoint is restricted to authenticated administrators', async (t) => {
  const restoreBlocks = replaceMethod(
    prisma.block,
    'findMany',
    (async () => []) as (...args: never[]) => unknown
  );
  const app = Fastify();
  await app.register(fastifyJwt, { secret: 'a-test-secret-longer-than-thirty-two-characters' });
  await app.register(apiRoutes);
  await app.ready();
  t.after(async () => {
    restoreBlocks();
    await app.close();
  });

  const anonymous = await app.inject({ method: 'GET', url: '/api/admin/statistical-analysis' });
  assert.equal(anonymous.statusCode, 401);

  const surveyorToken = app.jwt.sign({ role: 'surveyor' });
  const surveyor = await app.inject({
    method: 'GET',
    url: '/api/admin/statistical-analysis',
    headers: { authorization: `Bearer ${surveyorToken}` }
  });
  assert.equal(surveyor.statusCode, 403);

  const adminToken = app.jwt.sign({ role: 'admin' });
  const admin = await app.inject({
    method: 'GET',
    url: '/api/admin/statistical-analysis',
    headers: { authorization: `Bearer ${adminToken}` }
  });
  assert.equal(admin.statusCode, 200);
  assert.deepEqual(admin.json(), {
    officialSource: {
      sourceFile: 'total village List-2026_Hindi.pdf',
      totalEntries: 413,
      affectedEntries: 290,
      counts: { directOnly: 130, both: 31, indirectOnly: 129, unaffected: 123 }
    },
    blocks: []
  });
});

test('statistical analysis reports exclusive category counts and unaffected villages from persisted summaries', async (t) => {
  const restoreBlocks = replaceMethod(
    prisma.block,
    'findMany',
    (async () => [{
      id: 2,
      nameHindi: 'ओरछा',
      nameEnglish: 'Orchha (Abhujmad)',
      statisticalAnalysisSummary: {
        totalVillages: 10,
        unclassifiedVillages: 1,
        directVillageCount: 6,
        directVillageSurveysCompleted: 3,
        indirectVillageCount: 2,
        indirectVillageSurveysCompleted: 2,
        directHouseholdInput: 4,
        directHouseholdCompleted: 2,
        directVillageHouseholdCompletionPercentSum: 50,
        directVillageHouseholdCompletionPercentCount: 2,
        indirectHouseholdInput: 2,
        indirectHouseholdCompleted: 1,
        indirectVillageHouseholdCompletionPercentSum: 50,
        indirectVillageHouseholdCompletionPercentCount: 1,
        isStale: false,
        refreshedAt: null,
        sourceUpdatedAt: null
      },
      statisticalAnalysisRefreshQueue: null
    }]) as (...args: never[]) => unknown
  );
  const app = Fastify();
  await app.register(fastifyJwt, { secret: 'a-test-secret-longer-than-thirty-two-characters' });
  await app.register(apiRoutes);
  await app.ready();
  t.after(async () => {
    restoreBlocks();
    await app.close();
  });

  const adminToken = app.jwt.sign({ role: 'admin' });
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/statistical-analysis',
    headers: { authorization: `Bearer ${adminToken}` }
  });
  const body = response.json();

  assert.equal(response.statusCode, 200);
  assert.equal(body.blocks[0].blockName, 'Orcha');
  assert.equal(body.blocks[0].summary.totalVillages, 10);
  assert.equal(body.blocks[0].summary.directVillageCount, 6);
  assert.equal(body.blocks[0].summary.indirectVillageCount, 2);
  assert.equal(body.blocks[0].summary.unaffectedVillageCount, 1);
  assert.equal(
    body.blocks[0].summary.totalVillages
      - body.blocks[0].summary.directVillageCount
      - body.blocks[0].summary.indirectVillageCount
      - body.blocks[0].summary.unclassifiedVillages,
    body.blocks[0].summary.unaffectedVillageCount
  );
});

test('statistical analysis village drill-down is admin-only, filters by block/category, and returns finalized status', async (t) => {
  const village = {
    id: 11,
    nameHindi: 'ग्राम',
    nameEnglish: 'Village',
    affectedStatus: 'Direct and Indirect Both',
    villageSurvey: { isCompleted: true },
    gramPanchayat: {
      nameHindi: 'पंचायत',
      nameEnglish: 'Panchayat',
      block: { id: 1, nameEnglish: 'Narayanpur' }
    }
  };
  const indirectVillage = { ...village, id: 12, nameEnglish: 'Indirect Village', affectedStatus: 'Indirect Affected' };
  const restoreBlocks = replaceMethod(prisma.block, 'findMany', (async () => [
    { id: 1, nameEnglish: 'Narayanpur' }
  ]) as (...args: never[]) => unknown);
  const restoreCounts = replaceMethod(prisma.village, 'count', (async (args: { where: Record<string, unknown> }) => {
    if ('villageSurvey' in args.where) return 1;
    return 2;
  }) as (...args: never[]) => unknown);
  let villageQuery: Record<string, unknown> | undefined;
  const restoreVillages = replaceMethod(prisma.village, 'findMany', (async (args: { where: Record<string, unknown>; take: number; skip: number }) => {
    villageQuery = args.where;
    assert.equal(args.take, 10);
    assert.equal(args.skip, 0);
    const status = args.where.affectedStatus;
    return typeof status === 'object' && status !== null && 'in' in status ? [village] : [indirectVillage];
  }) as (...args: never[]) => unknown);
  const app = Fastify();
  await app.register(fastifyJwt, { secret: 'a-test-secret-longer-than-thirty-two-characters' });
  await app.register(apiRoutes);
  await app.ready();
  t.after(async () => {
    restoreBlocks();
    restoreCounts();
    restoreVillages();
    await app.close();
  });

  const anonymous = await app.inject({
    method: 'GET',
    url: '/api/admin/statistical-analysis/details?scope=village&category=DIRECT&metric=completion&page=1&pageSize=10&blockId=1'
  });
  assert.equal(anonymous.statusCode, 401);
  const surveyorToken = app.jwt.sign({ role: 'surveyor' });
  const forbidden = await app.inject({
    method: 'GET',
    url: '/api/admin/statistical-analysis/details?scope=village&category=DIRECT&metric=completion&page=1&pageSize=10&blockId=1',
    headers: { authorization: 'Bearer ' + surveyorToken }
  });
  assert.equal(forbidden.statusCode, 403);

  const adminToken = app.jwt.sign({ role: 'admin' });
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/statistical-analysis/details?scope=village&category=DIRECT&metric=completion&page=1&pageSize=10&blockId=1',
    headers: { authorization: 'Bearer ' + adminToken }
  });
  const body = response.json();
  assert.equal(response.statusCode, 200);
  assert.deepEqual(villageQuery?.affectedStatus, { in: ['Direct Affected', 'Direct and Indirect Both'] });
  assert.deepEqual(body.records.map((record: { villageId: number }) => record.villageId), [11]);
  assert.equal(body.records[0].affectedStatus, 'Direct and Indirect Both');
  assert.equal(body.records[0].surveyCompleted, true);
  assert.equal(body.records[0].completionPercent, 100);
  assert.equal(body.totals.eligibleVillages, 2);
  assert.equal(body.totals.completedVillages, 1);
  assert.equal(body.totals.completionPercent, 50);

  const indirectResponse = await app.inject({
    method: 'GET',
    url: '/api/admin/statistical-analysis/details?scope=village&category=INDIRECT&metric=villages&page=1&pageSize=10&blockId=1',
    headers: { authorization: 'Bearer ' + adminToken }
  });
  const indirectBody = indirectResponse.json();
  assert.equal(indirectResponse.statusCode, 200, JSON.stringify(indirectBody));
  assert.equal(villageQuery?.affectedStatus, 'Indirect Affected');
  assert.equal(indirectBody.records[0].affectedStatus, 'Indirect Affected');
  assert.equal(indirectBody.records.some((record: { affectedStatus: string }) => record.affectedStatus === 'Direct and Indirect Both'), false);

  const invalidPage = await app.inject({
    method: 'GET',
    url: '/api/admin/statistical-analysis/details?scope=village&category=DIRECT&metric=completion&page=0&pageSize=101',
    headers: { authorization: 'Bearer ' + adminToken }
  });
  assert.equal(invalidPage.statusCode, 400);
});

test('statistical analysis household drill-down returns actual house numbers and village-level completion', async (t) => {
  const village = {
    id: 19,
    nameHindi: 'ग्राम',
    nameEnglish: 'Village',
    affectedStatus: 'Direct Affected',
    gramPanchayat: {
      nameHindi: 'पंचायत',
      nameEnglish: 'Panchayat',
      block: { id: 1, nameEnglish: 'Narayanpur' }
    },
    households: [
      { id: 'hh-1', houseNumber: 14, isCompleted: true },
      { id: 'hh-2', houseNumber: 22, isCompleted: false }
    ]
  };
  const restoreBlocks = replaceMethod(prisma.block, 'findMany', (async () => [
    { id: 1, nameEnglish: 'Narayanpur' }
  ]) as (...args: never[]) => unknown);
  const restoreVillageCounts = replaceMethod(prisma.village, 'count', (async (args: { where: Record<string, unknown> }) => {
    if ('households' in args.where) {
      const filter = args.where.households as Record<string, unknown>;
      return 'some' in filter ? 1 : 0;
    }
    if ('villageSurvey' in args.where) return 0;
    return 1;
  }) as (...args: never[]) => unknown);
  let villageQuery: Record<string, unknown> | undefined;
  const restoreVillages = replaceMethod(prisma.village, 'findMany', (async (args: { where: Record<string, unknown> }) => {
    villageQuery = args.where;
    return [village];
  }) as (...args: never[]) => unknown);
  const restoreHouseholdCounts = replaceMethod(prisma.householdSurvey, 'count', (async (args: { where: Record<string, unknown> }) => (
    args.where.isCompleted === true ? 1 : 2
  )) as (...args: never[]) => unknown);
  const restoreHouseholdGroups = replaceMethod(prisma.householdSurvey, 'groupBy', (async () => [
    { villageId: 19, isCompleted: true, _count: { _all: 1 } },
    { villageId: 19, isCompleted: false, _count: { _all: 1 } }
  ]) as (...args: never[]) => unknown);
  const app = Fastify();
  await app.register(fastifyJwt, { secret: 'a-test-secret-longer-than-thirty-two-characters' });
  await app.register(apiRoutes);
  await app.ready();
  t.after(async () => {
    restoreBlocks();
    restoreVillageCounts();
    restoreVillages();
    restoreHouseholdCounts();
    restoreHouseholdGroups();
    await app.close();
  });

  const adminToken = app.jwt.sign({ role: 'admin' });
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/statistical-analysis/details?scope=household&category=DIRECT&metric=completion&page=1&pageSize=25&blockId=1',
    headers: { authorization: 'Bearer ' + adminToken }
  });
  const body = response.json();
  assert.equal(response.statusCode, 200);
  assert.deepEqual(body.records[0].households.map((house: { houseNumber: number }) => house.houseNumber), [14, 22]);
  assert.deepEqual(body.records[0].households.map((house: { isCompleted: boolean }) => house.isCompleted), [true, false]);
  assert.equal(body.records[0].villageCompletionPercent, 50);
  assert.equal(body.totals.householdCount, 2);
  assert.equal(body.totals.completedHouseholdCount, 1);

  const averageResponse = await app.inject({
    method: 'GET',
    url: '/api/admin/statistical-analysis/details?scope=household&category=DIRECT&metric=average&page=1&pageSize=25&blockId=1',
    headers: { authorization: 'Bearer ' + adminToken }
  });
  const averageBody = averageResponse.json();
  assert.equal(averageResponse.statusCode, 200);
  assert.ok('some' in (villageQuery?.households as Record<string, unknown>));
  assert.equal(averageBody.totals.metricCount, 1);
  assert.equal(averageBody.totals.villagesWithHouseholds, 1);
  assert.equal(averageBody.totals.averagePercent, 50);
});

test('admin hierarchy exposes persisted village completion statuses', async (t) => {
  const restoreBlocks = replaceMethod(
    prisma.block,
    'findMany',
    (async () => [{
      id: 2,
      nameHindi: 'ब्लॉक',
      nameEnglish: 'Block',
      gramPanchayats: [{
        id: 4,
        nameHindi: 'पंचायत',
        nameEnglish: 'Panchayat',
        villages: [
          { id: 6, nameHindi: 'पूर्ण', nameEnglish: 'Complete', affectedStatus: '', population: 0, villageSurvey: { isCompleted: true } },
          { id: 7, nameHindi: 'अपूर्ण', nameEnglish: 'Incomplete', affectedStatus: '', population: 0, villageSurvey: { isCompleted: false } },
          { id: 8, nameHindi: 'नहीं', nameEnglish: 'Unavailable', affectedStatus: '', population: 0, villageSurvey: null }
        ]
      }]
    }]) as (...args: never[]) => unknown
  );
  t.after(restoreBlocks);

  let result: unknown;
  const reply = {
    send(payload: unknown) { result = payload; return payload; }
  } as unknown as FastifyReply;
  await getAdminHierarchy({} as FastifyRequest, reply);

  const hierarchy = result as { panchayats: { villages: { surveyStatus: string }[] }[] }[];
  assert.deepEqual(
    hierarchy[0].panchayats[0].villages.map((village) => village.surveyStatus),
    ['completed', 'incomplete', 'unavailable']
  );
});
