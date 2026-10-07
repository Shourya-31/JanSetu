import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import Fastify, { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import dotenv from 'dotenv';

dotenv.config();

let app: FastifyInstance;
let adminToken: string;
let surveyorToken: string;

before(async () => {
  const [{ default: apiRoutes }] = await Promise.all([import('../src/routes/api')]);
  app = Fastify({
    ajv: {
      customOptions: {
        removeAdditional: false,
        coerceTypes: 'array',
        useDefaults: true,
        allErrors: true
      }
    }
  });
  await app.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'jansetu_dmft_super_secret_key_2026_district_collector' });
  await app.register(apiRoutes);
  await app.ready();
});

after(async () => {
  await app.close();
});

test('1. Auth login for Admin and Surveyor', async () => {
  const adminRes = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { role: 'admin', identifier: 'admin01', password: 'ZiOgoGw8WzCCS5dSZV3Ubx4yk4XPHd745OyCslxfGOk' }
  });
  assert.equal(adminRes.statusCode, 200, adminRes.body);
  const adminBody = adminRes.json();
  assert.equal(adminBody.success, true);
  adminToken = adminBody.token;

  const surveyorRes = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { role: 'surveyor', identifier: 'surveyor01', password: '32WFXKtErxz0HfUQ6zgBN9T0h-T3RosOA2HR2Wk5t1c' }
  });
  assert.equal(surveyorRes.statusCode, 200, surveyorRes.body);
  const surveyorBody = surveyorRes.json();
  assert.equal(surveyorBody.success, true);
  surveyorToken = surveyorBody.token;
});

test('2. Hierarchy API returns blocks and panchayats', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/api/hierarchy',
    headers: { authorization: `Bearer ${surveyorToken}` }
  });
  assert.equal(res.statusCode, 200, res.body);
  const blocks = res.json();
  assert.ok(Array.isArray(blocks));
  assert.ok(blocks.length > 0);
  assert.equal(blocks[0].blockName, 'नारायणपुर');
});

test('3. Save and Fetch Village Profile API', async () => {
  const saveRes = await app.inject({
    method: 'POST',
    url: '/api/villages/profile',
    headers: { authorization: `Bearer ${surveyorToken}` },
    payload: {
      block: 'नारायणपुर',
      panchayat: 'खड़कागांव',
      villageName: 'खड़कागांव',
      villageSurvey: {
        totalHouseholds: '150',
        anganbadiData: [],
        schoolData: [],
        hostelData: [],
        healthData: [],
        waterData: {},
        employmentData: {},
        ladiesData: {},
        cleanlinessData: {},
        pensionData: {},
        developmentData: {}
      }
    }
  });
  assert.equal(saveRes.statusCode, 200, saveRes.body);

  const getRes = await app.inject({
    method: 'GET',
    url: '/api/villages/profile?villageName=' + encodeURIComponent('खड़कागांव'),
    headers: { authorization: `Bearer ${surveyorToken}` }
  });
  assert.equal(getRes.statusCode, 200, getRes.body);
  const village = getRes.json();
  assert.equal(village.villageName, 'खड़कागांव');
});

test('4. Fetch all villages and Admin Analytics API', async () => {
  const allVillagesRes = await app.inject({
    method: 'GET',
    url: '/api/villages/all',
    headers: { authorization: `Bearer ${surveyorToken}` }
  });
  assert.equal(allVillagesRes.statusCode, 200, allVillagesRes.body);

  const analyticsRes = await app.inject({
    method: 'GET',
    url: '/api/admin/analytics',
    headers: { authorization: `Bearer ${adminToken}` }
  });
  assert.equal(analyticsRes.statusCode, 200, analyticsRes.body);
  const analytics = analyticsRes.json();
  assert.ok('totalVillages' in analytics);
  assert.ok('totalHouseholds' in analytics);
});

test('5. Admin Query and Household Verification API', async () => {
  const queryRes = await app.inject({
    method: 'POST',
    url: '/api/admin/query',
    headers: { authorization: `Bearer ${adminToken}` },
    payload: {
      block: 'नारायणपुर'
    }
  });
  assert.equal(queryRes.statusCode, 200, queryRes.body);
  const queryRows = queryRes.json();
  assert.ok(Array.isArray(queryRows));
});
