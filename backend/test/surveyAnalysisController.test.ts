import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import type { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../src/config/prisma';
import { apiRoutes } from '../src/routes/api';
import {
  getHouseholdSurveyAnalysis,
  getVillageSurveyAnalysis
} from '../src/controllers/surveyAnalysisController';

function replaceMethod(target: object, key: string, value: (...args: never[]) => unknown): () => void {
  const previous = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(target, key, { configurable: true, writable: true, value });
  return () => {
    if (previous) Object.defineProperty(target, key, previous);
    else Reflect.deleteProperty(target, key);
  };
}

test('village analysis returns persisted status and scoped totals with pagination', async (t) => {
  let listQuery: Record<string, unknown> | undefined;
  const restoreFindMany = replaceMethod(
    prisma.village,
    'findMany',
    (async (query: Record<string, unknown>) => {
      listQuery = query;
      return [{
        id: 21,
        nameHindi: 'परीक्षण गाँव',
        nameEnglish: 'Test Village',
        affectedStatus: 'Direct Affected',
        isSurveyFilled: false,
        villageSurvey: {
          id: 'survey-21',
          isCompleted: false,
          progress: 40,
          surveyData: { tapWater: 'हाँ' },
          villagePhotos: [],
          updatedAt: new Date('2026-10-28T00:00:00.000Z')
        },
        gramPanchayat: {
          id: 7,
          nameHindi: 'परीक्षण पंचायत',
          block: { id: 3, nameHindi: 'परीक्षण ब्लॉक' }
        }
      }];
    }) as (...args: never[]) => unknown
  );
  const restoreCount = replaceMethod(
    prisma.village,
    'count',
    (async (query: { where: Record<string, unknown> }) => {
      const where = query.where;
      if ('villageSurvey' in where) {
        const survey = where.villageSurvey as { is?: { isCompleted?: boolean } | null };
        if (survey.is === null) return 4;
        if (survey.is?.isCompleted === true) return 3;
        if (survey.is?.isCompleted === false) return 2;
      }
      return 9;
    }) as (...args: never[]) => unknown
  );
  t.after(restoreFindMany);
  t.after(restoreCount);

  let result: unknown;
  const reply = {
    send(payload: unknown) { result = payload; return payload; },
    code() { return this; }
  } as unknown as FastifyReply;
  await getVillageSurveyAnalysis({
    query: {
      blockId: '3',
      panchayatId: '7',
      page: 2,
      pageSize: 5,
      status: 'incomplete',
      sortBy: 'affectedStatus'
    }
  } as FastifyRequest, reply);

  const payload = result as {
    records: { surveyStatus: string; progress: number; tapWater: string; data: { tapWater: string } }[];
    total: number;
    totalPages: number;
    stats: { total: number; completed: number; incomplete: number; pending: number; completionPercent: number };
  };
  assert.deepEqual(listQuery?.skip, 5);
  assert.deepEqual(listQuery?.take, 5);
  assert.deepEqual(listQuery?.where, {
    gramPanchayat: { blockId: 3, id: 7 },
    villageSurvey: { is: { isCompleted: false } }
  });
  assert.deepEqual(listQuery?.orderBy, [
    { affectedStatus: 'asc' },
    { nameHindi: 'asc' },
    { id: 'asc' }
  ]);
  assert.equal(payload.records[0].surveyStatus, 'incomplete');
  assert.equal(payload.records[0].progress, 40);
  assert.equal(payload.records[0].tapWater, 'हाँ');
  assert.equal(payload.records[0].data.tapWater, 'हाँ');
  assert.equal(payload.total, 2);
  assert.equal(payload.totalPages, 1);
  assert.deepEqual(payload.stats, {
    total: 9,
    completed: 3,
    incomplete: 2,
    pending: 4,
    completionPercent: 33
  });
});

test('household analysis searches house numbers and counts completion from isCompleted', async (t) => {
  let listQuery: Record<string, unknown> | undefined;
  const restoreFindMany = replaceMethod(
    prisma.householdSurvey,
    'findMany',
    (async (query: Record<string, unknown>) => {
      listQuery = query;
      return [{
        id: 'house-1',
        villageId: 21,
        houseNumber: 8,
        headName: 'सर्वेक्षित परिवार',
        mobile: '9000000000',
        totalMembers: 4,
        isCompleted: true,
        eldersCount: 1,
        childrenCount: 2,
        womenCount: 2,
        noCasteCertMembers: 1,
        marriageCertificate: 'हाँ',
        childrenWithoutBirthCert: 1,
        village: {
          id: 21,
          nameHindi: 'परीक्षण गाँव',
          gramPanchayat: {
            id: 7,
            nameHindi: 'परीक्षण पंचायत',
            block: { id: 3, nameHindi: 'परीक्षण ब्लॉक' }
          }
        }
      }];
    }) as (...args: never[]) => unknown
  );
  const restoreCount = replaceMethod(
    prisma.householdSurvey,
    'count',
    (async (query: { where: Record<string, unknown> }) =>
      'isCompleted' in query.where
        ? query.where.isCompleted === true ? 5 : 6
        : 11) as (...args: never[]) => unknown
  );
  t.after(restoreFindMany);
  t.after(restoreCount);

  let result: unknown;
  const reply = {
    send(payload: unknown) { result = payload; return payload; },
    code() { return this; }
  } as unknown as FastifyReply;
  await getHouseholdSurveyAnalysis({
    query: {
      blockId: '3',
      panchayatId: '7',
      villageId: '21',
      page: 3,
      pageSize: 10,
      search: '8',
      sortBy: 'headName',
      sortOrder: 'desc'
    }
  } as FastifyRequest, reply);

  const payload = result as {
    records: {
      villageName: string;
      panchayatName: string;
      blockName: string;
      totalMembers: number | null;
      mobileNumber: string;
      marriagecertificate: string;
      childrenWithoutBirthCertificate: number;
      women: number;
      noCasteCertificateMembers: number;
      completed: boolean;
    }[];
    total: number;
    stats: { total: number; completed: number; incomplete: number; pending: number; completionPercent: number };
  };
  assert.equal(listQuery?.skip, 20);
  assert.equal(listQuery?.take, 10);
  assert.equal((listQuery?.select as Record<string, unknown>).totalMembers, true);
  assert.deepEqual(listQuery?.where, {
    village: {
      id: 21,
      gramPanchayat: { blockId: 3, id: 7 }
    },
    OR: [
      { headName: { contains: '8', mode: 'insensitive' } },
      { mobile: { contains: '8' } },
      { houseNumber: 8 },
      {
        village: {
          is: {
            OR: [
              { nameHindi: { contains: '8', mode: 'insensitive' } },
              { nameEnglish: { contains: '8', mode: 'insensitive' } }
            ]
          }
        }
      }
    ]
  });
  assert.deepEqual(listQuery?.orderBy, [
    { headName: 'desc' },
    { villageId: 'asc' },
    { houseNumber: 'asc' }
  ]);
  assert.deepEqual(payload.records[0], {
    id: 'house-1',
    villageId: 21,
    houseNumber: 8,
    headName: 'सर्वेक्षित परिवार',
    mobile: '9000000000',
    totalMembers: 4,
    isCompleted: true,
    eldersCount: 1,
    childrenCount: 2,
    womenCount: 2,
    noCasteCertMembers: 1,
    marriageCertificate: 'हाँ',
    childrenWithoutBirthCert: 1,
    village: {
      id: 21,
      nameHindi: 'परीक्षण गाँव',
      gramPanchayat: {
        id: 7,
        nameHindi: 'परीक्षण पंचायत',
        block: { id: 3, nameHindi: 'परीक्षण ब्लॉक' }
      }
    },
    mobileNumber: '9000000000',
    villageName: 'परीक्षण गाँव',
    panchayatName: 'परीक्षण पंचायत',
    blockName: 'परीक्षण ब्लॉक',
    completed: true,
    elderly: 1,
    children: 2,
    women: 2,
    noCasteCertificateMembers: 1,
    marriagecertificate: 'हाँ',
    childrenWithoutBirthCertificate: 1
  });
  assert.equal(payload.total, 11);
  assert.deepEqual(payload.stats, {
    total: 11,
    completed: 5,
    incomplete: 6,
    pending: 6,
    completionPercent: 45
  });
});

test('survey analysis endpoints require an administrator and validate query parameters', async (t) => {
  const app = Fastify();
  await app.register(fastifyJwt, { secret: 'a-test-secret-longer-than-thirty-two-characters' });
  await app.register(apiRoutes);
  await app.ready();
  t.after(() => app.close());

  for (const endpoint of [
    '/api/admin/survey-analysis/villages',
    '/api/admin/survey-analysis/households'
  ]) {
    const anonymous = await app.inject({ method: 'GET', url: endpoint });
    assert.equal(anonymous.statusCode, 401);

    const surveyorToken = app.jwt.sign({ role: 'surveyor' });
    const forbidden = await app.inject({
      method: 'GET',
      url: endpoint,
      headers: { authorization: `Bearer ${surveyorToken}` }
    });
    assert.equal(forbidden.statusCode, 403);

    const adminToken = app.jwt.sign({ role: 'admin' });
    const invalid = await app.inject({
      method: 'GET',
      url: `${endpoint}?blockId=0&pageSize=500`,
      headers: { authorization: `Bearer ${adminToken}` }
    });
    assert.equal(invalid.statusCode, 400);
  }
});
