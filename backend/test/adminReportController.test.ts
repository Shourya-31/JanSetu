import assert from 'node:assert/strict';
import test from 'node:test';
import type { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../src/config/prisma';
import { getAnalyticsSummary } from '../src/controllers/adminController';
import { getAdminSurveys } from '../src/controllers/adminReportController';
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
