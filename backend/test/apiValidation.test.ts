import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import Fastify, { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';

let app: FastifyInstance;

before(async () => {
  process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test?connect_timeout=1';
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
  await app.register(fastifyJwt, { secret: 'phase-two-test-secret-long-enough-32-chars' });
  await app.register(apiRoutes);
  await app.ready();
});

after(async () => {
  await app.close();
});

function householdSubmission() {
  const fields = [
    'headName', 'mobile', 'surveyDate', 'surveyorName', 'caste', 'isBpl', 'elderly', 'children', 'women',
    'rationCard', 'noAadhaarMembers', 'aadhaarEkyc', 'noCasteCertificateMembers', 'noAyushmanMembers',
    'noVoterIdMembers', 'mnregaJobCard', 'noShramikCardMembers', 'janDhanAccount', 'kcc', 'forestRightsPatta',
    'marriagecertificate', 'bankName', 'jsy', 'pmmvy', 'mahtariVandana', 'widowPension', 'disabilityPension',
    'needsAssistiveDevice', 'assistanceTypes', 'otherAssistance', 'deathInLastYear', 'deathCertificateReceived',
    'pmGaribKalyanRation', 'childrenWithoutBirthCertificate', 'vaccinationStatus', 'anganwadiMeal',
    'childrenSchoolStatus', 'schoolNotGoingReason', 'otherSchoolReason', 'unemployedMembers', 'pmKisan',
    'miningEmployment', 'annualIncome', 'mainIncomeSource', 'livestockSource', 'otherLivestockSource',
    'animalEmployment', 'houseType', 'housingSchemeBenefit', 'toiletStatus', 'tapWaterConnection',
    'drinkingWaterSource', 'electricityConnection', 'solarEnergy', 'familyDisease', 'freeMedicines',
    'shgMember', 'priorityNeed1', 'priorityNeed2', 'priorityNeed3', 'eligibleSchemeNotReceived', 'schemeBenefitName'
  ];
  const arrayFields = new Set(['assistanceTypes', 'schoolNotGoingReason']);
  return Object.assign({
    villageName: 'Test Village',
    houseNumber: 1,
    generalCompleted: true,
    demographyCompleted: true,
    documentsCompleted: true,
    womenCompleted: true,
    disabilityCompleted: true,
    educationCompleted: true,
    employmentCompleted: true,
    housingCompleted: true,
    healthCompleted: true,
    shgCompleted: true,
    otherCompleted: true
  }, Object.fromEntries(fields.map((field) => [field, arrayFields.has(field) ? [] : ''])));
}

function authorization(role: 'admin' | 'surveyor') {
  const token = app.jwt.sign({ id: `${role}-id`, role });
  return { authorization: `Bearer ${token}` };
}

test('admin routes reject requests without a token', async () => {
  const response = await app.inject({ method: 'GET', url: '/api/admin/analytics' });
  assert.equal(response.statusCode, 401);
});

test('surveyor tokens cannot access admin analytics', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/analytics',
    headers: authorization('surveyor')
  });
  assert.equal(response.statusCode, 403);
});

test('login rejects missing credentials before reaching the database', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { role: 'admin', identifier: 'admin01' }
  });
  assert.equal(response.statusCode, 400);
});

test('admin filters reject unsupported categorical values', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/query',
    headers: authorization('admin'),
    payload: { isBPL: 'Maybe' }
  });
  assert.equal(response.statusCode, 400);
});

test('routes reject unknown query parameters', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/villages/all?unexpected=1',
    headers: authorization('surveyor')
  });
  assert.equal(response.statusCode, 400);
});

test('household submissions reject unknown module fields', async () => {
  const data = { ...householdSubmission(), unrecognizedModuleAnswer: 'unexpected' };
  const response = await app.inject({
    method: 'POST',
    url: '/api/households',
    headers: authorization('surveyor'),
    payload: { data }
  });
  assert.equal(response.statusCode, 400);
});

test('household submissions require all eleven completed sections', async () => {
  const data = { ...householdSubmission(), healthCompleted: false };
  const response = await app.inject({
    method: 'POST',
    url: '/api/households',
    headers: authorization('surveyor'),
    payload: { data }
  });
  assert.equal(response.statusCode, 400);
});

test('valid household module fields pass schema validation', async () => {
  const data = {
    ...householdSubmission(),
    headName: 'Survey Head',
    mobile: '9876543210',
    assistanceTypes: ['उपकरण'],
    schoolNotGoingReason: ['दूरी']
  };
  const response = await app.inject({
    method: 'POST',
    url: '/api/households',
    headers: authorization('surveyor'),
    payload: { data }
  });
  assert.equal(response.statusCode, 500, response.body);
  assert.match(response.body, /Internal Server Error/);
});

test('village surveys reject unknown section fields', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/villages/profile',
    headers: authorization('surveyor'),
    payload: {
      block: 'Narayanpur',
      panchayat: 'Test Panchayat',
      villageName: 'Test Village',
      villageSurvey: { unrecognizedSection: { value: 'unexpected' } }
    }
  });
  assert.equal(response.statusCode, 400);
});

test('valid village survey section data passes schema validation', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/villages/profile',
    headers: authorization('surveyor'),
    payload: {
      block: 'Narayanpur',
      panchayat: 'Test Panchayat',
      villageName: 'Test Village',
      villageSurvey: {
        totalHouseholds: '10',
        anganbadiData: [{
          centerName: 'Center 1', buildingAvailability: '', buildingCondition: '', operation: '',
          nutritionServices: '', toiletCondition: '', drinkingWater: '', watersupply: '',
          electricity: '', nutritionGarden: ''
        }],
        schoolData: [],
        hostelData: [],
        healthData: [],
        waterData: {
          tapWaterAvailability: 'Yes', summerWaterCondition: '', drinkingQuality: '', waterQualityProblem: '',
          otherWaterQualityProblem: '', waterDistance: '', pipelineRequirement: '', waterTankRequirement: ''
        },
        employmentData: {
          unemployedYouth: '', livelihoodActivities: ['Farming'], migration: '', migrantPersons: '',
          migrationDestination: '', migrationReason: '', migrationDuration: '', nearestITICollegeDistance: '',
          skillTraining: '', majorTraining: '', employmentAfterTraining: '', requiredTraining1: '', requiredTraining2: ''
        },
        ladiesData: {
          shgOperated: 'Yes', totalSHG: '', activeSHG: '', majorSHGActivities: '', shgSupport: '',
          bankingFacility: '', nearestBankDistance: '', familyBankAccounts: ''
        },
        cleanlinessData: { toiletAvailability: 'Yes', solidWasteManagement: '', drainageSystem: '' },
        pensionData: {
          disabledEligible: '', disabledNotReceiving: '', widowEligible: '', widowNotReceiving: '',
          elderlyEligible: '3', elderlyNotReceiving: ''
        },
        developmentData: {
          handpumpRequirement: '', borewellRequirement: '', solarPumpRequirement: '', solarStreetLightRequirement: '',
          roadRequirement: '', otherInfrastructureRequirement: '', priorityWork1: 'Road repair',
          priorityWork2: '', priorityWork3: '', additionalRemarks: ''
        }
      }
    }
  });
  assert.equal(response.statusCode, 500);
  assert.match(response.body, /Internal Server Error/);
});