import assert from 'node:assert/strict';
import test from 'node:test';
import type { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../src/config/prisma';
import { getAdminSurveys } from '../src/controllers/adminReportController';

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
      nameEnglish: 'Test Panchayat',
      block: { nameEnglish: 'Test Block' }
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
    query: { blockId: 'test-block' }
  } as FastifyRequest, reply);

  const payload = result as {
    householdSurveys: { answers: { animalEmployment: string } }[];
  };
  assert.deepEqual(
    payload.householdSurveys.map((household) => household.answers.animalEmployment),
    ['हाँ', 'नहीं', 'पात्रता नहीं']
  );
});
