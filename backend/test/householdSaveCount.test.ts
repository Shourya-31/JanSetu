import assert from 'node:assert/strict';
import test from 'node:test';
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
