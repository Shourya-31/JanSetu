import assert from 'node:assert/strict';
import test from 'node:test';
import type { HouseholdSurvey } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../src/config/prisma';
import { createHouseholdSlots, getHouseholdSurveys, saveHouseholdSurvey } from '../src/controllers/householdController';

function replaceMethod(target: object, key: string, value: (...args: never[]) => unknown): () => void {
  const previous = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(target, key, { configurable: true, writable: true, value });
  return () => {
    if (previous) Object.defineProperty(target, key, previous);
    else Reflect.deleteProperty(target, key);
  };
}

test('household updates persist total members and retain answers omitted from a draft payload', async (t) => {
  const existing = {
    id: 'household-1',
    trackingId: 'DMFT-HHD-1',
    villageId: 12,
    houseNumber: 1,
    headName: 'Saved head',
    totalMembers: 4,
    eldersCount: 1,
    childrenCount: 1,
    womenCount: 2,
    completedSections: 1,
    isCompleted: false,
    mobile: '',
    surveyDate: '',
    surveyorName: '',
    caste: 'सामान्य',
    isBpl: '',
    animalEmployment: 'पात्रता नहीं'
  } as HouseholdSurvey;
  let persistedUpdate: Record<string, unknown> | undefined;
  let persistedWhere: unknown;
  const tx = {
    $executeRaw: async () => 1,
    village: {
      findFirst: async () => ({ id: 12, nameHindi: 'Test village' })
    },
    villageSurvey: {
      findUnique: async () => ({ surveyData: { householdSurveyCount: 1 } })
    },
    householdSurvey: {
      findUnique: async () => existing,
      upsert: async ({ where, update }: { where: unknown; update: Record<string, unknown> }) => {
        persistedWhere = where;
        persistedUpdate = update;
        return { ...existing, ...update };
      }
    },
    surveyAuditLog: {
      create: async () => ({})
    }
  };
  const restoreTransaction = replaceMethod(
    prisma,
    '$transaction',
    (async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx)) as (...args: never[]) => unknown
  );
  t.after(restoreTransaction);

  const response = createReply();
  await saveHouseholdSurvey({
    body: {
      villageName: 'Test village',
      houseNumber: 1,
      data: { totalMembers: '7', completedSections: 2 }
    },
    user: { id: 'surveyor-1' }
  } as FastifyRequest, response.reply);

  assert.equal(response.result.response?.statusCode, 200);
  assert.deepEqual(persistedWhere, {
    uq_house_per_village: { villageId: 12, houseNumber: 1 }
  });
  assert.equal(persistedUpdate?.totalMembers, 7);
  assert.equal(persistedUpdate?.headName, 'Saved head');
  assert.equal(persistedUpdate?.caste, 'सामान्य');
  assert.equal(persistedUpdate?.animalEmployment, 'पात्रता नहीं');
  assert.equal(persistedUpdate?.eldersCount, 1);
  assert.equal(
    (response.result.response?.payload as { data: { totalMembers: number } }).data.totalMembers,
    7
  );

  const exactValueResponse = createReply();
  await saveHouseholdSurvey({
    body: {
      villageName: 'Test village',
      houseNumber: 1,
      data: { animalEmployment: 'पात्रता नहीं' }
    },
    user: { id: 'surveyor-1' }
  } as FastifyRequest, exactValueResponse.reply);

  assert.equal(persistedUpdate?.animalEmployment, 'पात्रता नहीं');
  assert.equal(
    (exactValueResponse.result.response?.payload as { data: { animalEmployment: string } }).data.animalEmployment,
    'पात्रता नहीं'
  );
});

test('household GET restores the persisted total in its form answers', async (t) => {
  const savedRecord = {
    id: 'household-1',
    trackingId: 'DMFT-HHD-1',
    villageId: 12,
    houseNumber: 1,
    headName: 'Saved head',
    totalMembers: 6,
    eldersCount: 1,
    childrenCount: 2,
    womenCount: 3,
    completedSections: 1,
    isCompleted: false,
    auditStatus: 'Draft',
    registryStatus: 'Draft',
    animalEmployment: 'पात्रता नहीं'
  };
  const restoreVillageLookup = replaceMethod(
    prisma.village,
    'findUnique',
    (async () => ({
      id: 12,
      nameHindi: 'Test village',
      villageSurvey: { surveyData: { householdSurveyCount: 1 } }
    })) as (...args: never[]) => unknown
  );
  const restoreHouseholdList = replaceMethod(
    prisma.householdSurvey,
    'findMany',
    (async () => [savedRecord]) as (...args: never[]) => unknown
  );
  t.after(restoreVillageLookup);
  t.after(restoreHouseholdList);

  const response = createReply();
  await getHouseholdSurveys({ query: { villageId: 12 } } as FastifyRequest, response.reply);

  const payload = response.result.response?.payload as {
    households: Record<string, { totalMembers: number; surveyAnswers: { totalMembers: number } }>;
  };
  assert.equal(payload.households['1'].totalMembers, 6);
  assert.equal(payload.households['1'].surveyAnswers.totalMembers, 6);
  assert.equal(payload.households['1'].surveyAnswers.animalEmployment, 'पात्रता नहीं');
});

test('household save returns a conflict before writing when its number exceeds the village count', async (t) => {
  let villageWhere: unknown;
  let householdWriteAttempted = false;
  const tx = {
    $executeRaw: async () => 1,
    village: {
      findFirst: async ({ where }: { where: unknown }) => {
        villageWhere = where;
        return { id: 12, nameHindi: 'Test village' };
      }
    },
    villageSurvey: {
      findUnique: async () => ({ surveyData: { householdSurveyCount: 1 } })
    },
    householdSurvey: {
      findUnique: async () => {
        householdWriteAttempted = true;
        return null;
      },
      upsert: async () => {
        householdWriteAttempted = true;
        return {};
      }
    }
  };

  const restoreTransaction = replaceMethod(
    prisma,
    '$transaction',
    (async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx)) as (...args: never[]) => unknown
  );
  t.after(restoreTransaction);

  let response: { statusCode: number; payload: unknown } | undefined;
  const reply = {
    status(statusCode: number) {
      return {
        send(payload: unknown) {
          response = { statusCode, payload };
          return response;
        }
      };
    }
  };
  const request = {
    body: {
      villageName: 'Test village',
      villageId: null,
      houseNumber: 2,
      data: {
        headName: 'Should not be saved',
        block: 'Block',
        panchayat: 'Panchayat'
      }
    },
    user: { id: 'surveyor-1' }
  };

  await saveHouseholdSurvey(request as FastifyRequest, reply as unknown as FastifyReply);

  assert.deepEqual(villageWhere, {
    nameHindi: 'Test village',
    gramPanchayat: { nameHindi: 'Panchayat', block: { nameHindi: 'Block' } }
  });
  assert.equal(response?.statusCode, 409);
  assert.equal(householdWriteAttempted, false);
});

test('count initialization resolves the scoped village name and GET returns its count with no saved households', async (t) => {
  let initializationWhere: unknown;
  let persistedVillageId: number | undefined;
  let persistedSurveyData: Record<string, unknown> | undefined;
  const tx = {
    $executeRaw: async () => 1,
    village: {
      findFirst: async ({ where }: { where: unknown }) => {
        initializationWhere = where;
        return { id: 12, nameHindi: 'Test village' };
      }
    },
    villageSurvey: {
      findUnique: async () => ({ surveyData: { existingVillageData: true } }),
      upsert: async ({ where, create }: {
        where: { villageId: number };
        create: { surveyData: Record<string, unknown> };
      }) => {
        persistedVillageId = where.villageId;
        persistedSurveyData = create.surveyData;
        return {};
      }
    },
    householdSurvey: {
      findMany: async () => []
    }
  };
  const restoreTransaction = replaceMethod(
    prisma,
    '$transaction',
    (async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx)) as (...args: never[]) => unknown
  );
  t.after(restoreTransaction);

  const initReply = createReply();
  await createHouseholdSlots({
    body: {
      villageName: 'Test village',
      block: 'Block',
      panchayat: 'Panchayat',
      count: 125
    }
  } as FastifyRequest, initReply.reply);

  assert.deepEqual(initializationWhere, {
    nameHindi: 'Test village',
    gramPanchayat: { nameHindi: 'Panchayat', block: { nameHindi: 'Block' } }
  });
  assert.equal(persistedVillageId, 12);
  assert.equal(persistedSurveyData?.householdSurveyCount, 125);
  assert.equal(persistedSurveyData?.existingVillageData, true);
  assert.equal((initReply.result.response?.payload as { householdCount: number }).householdCount, 125);

  let getWhere: unknown;
  const restoreVillageLookup = replaceMethod(
    prisma.village,
    'findFirst',
    (async ({ where }: { where: unknown }) => {
      getWhere = where;
      return {
        id: 12,
        nameHindi: 'Test village',
        villageSurvey: { surveyData: { householdSurveyCount: 125 } }
      };
    }) as (...args: never[]) => unknown
  );
  const restoreHouseholdList = replaceMethod(
    prisma.householdSurvey,
    'findMany',
    (async () => []) as (...args: never[]) => unknown
  );
  t.after(restoreVillageLookup);
  t.after(restoreHouseholdList);

  const getReply = createReply();
  await getHouseholdSurveys({
    query: { villageName: 'Test village', villageId: 'NaN', block: 'Block', panchayat: 'Panchayat' }
  } as FastifyRequest, getReply.reply);

  const getPayload = getReply.result.response?.payload as { householdCount: number; households: Record<string, unknown> };
  assert.deepEqual(getWhere, {
    nameHindi: 'Test village',
    gramPanchayat: { nameHindi: 'Panchayat', block: { nameHindi: 'Block' } }
  });
  assert.equal(getPayload.householdCount, 125);
  assert.deepEqual(getPayload.households, {});
});

function createReply() {
  const result: { response?: { statusCode: number; payload: unknown } } = {};
  const reply = {
    status(statusCode: number) {
      return {
        send(payload: unknown) {
          result.response = { statusCode, payload };
          return payload;
        }
      };
    },
    send(payload: unknown) {
      result.response = { statusCode: 200, payload };
      return payload;
    }
  } as unknown as FastifyReply;
  return { response: result.response, reply, result };
}
