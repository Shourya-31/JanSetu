import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import type { HouseholdSurvey } from '@prisma/client';
import { householdSlotInitializationSchema, householdSubmissionEnvelopeSchema } from '../src/routes/surveySchemas';
import { validateAnimalEmploymentAnswer } from '../src/routes/api';
import { toHouseholdSurveyAnswers } from '../src/utils/householdSurvey';

test('household response restores saved answers and section progress', () => {
  const record = {
    headName: 'Saved household',
    mobile: '1234567890',
    surveyDate: '2026-10-14',
    surveyorName: 'survey-user',
    caste: '',
    isBpl: '',
    totalMembers: 5,
    eldersCount: 0,
    childrenCount: 0,
    womenCount: 0,
    rationCard: null,
    noAadhaarMembers: 0,
    aadhaarEkyc: null,
    noCasteCertMembers: 0,
    noAyushmanMembers: 0,
    noVoterIdMembers: 0,
    mnregaJobCard: null,
    noShramikCardMembers: 0,
    janDhanAccount: null,
    bankName: null,
    kcc: null,
    forestRightsPatta: null,
    marriageCertificate: null,
    jsy: null,
    pmmvy: null,
    mahtariVandana: null,
    widowPension: null,
    disabilityPension: null,
    needsAssistiveDevice: null,
    assistanceTypes: [],
    otherAssistance: null,
    deathInLastYear: null,
    deathCertificateReceived: null,
    pmGaribKalyanRation: null,
    childrenWithoutBirthCert: 0,
    vaccinationStatus: null,
    anganwadiMeal: null,
    childrenSchoolStatus: null,
    schoolNotGoingReason: [],
    otherSchoolReason: null,
    unemployedMembers: 0,
    pmKisan: null,
    miningEmployment: null,
    annualIncome: null,
    mainIncomeSource: null,
    livestockSource: null,
    otherLivestockSource: null,
    animalEmployment: 'पात्रता नहीं',
    houseType: null,
    housingSchemeBenefit: null,
    toiletStatus: null,
    tapWaterConnection: null,
    drinkingWaterSource: null,
    electricityConnection: null,
    solarEnergy: null,
    familyDisease: null,
    freeMedicines: null,
    shgMember: null,
    priorityNeed1: null,
    priorityNeed2: null,
    priorityNeed3: null,
    eligibleSchemeNotReceived: null,
    schemeBenefitName: null,
    completedSections: 1,
    isCompleted: false
  } as HouseholdSurvey;

  const answers = toHouseholdSurveyAnswers(record);

  assert.equal(answers.headName, 'Saved household');
  assert.equal(answers.surveyDate, '2026-10-14');
  assert.equal(answers.completedSections, 1);
  assert.equal(answers.totalMembers, 5);
  assert.equal(answers.animalEmployment, 'पात्रता नहीं');
  assert.equal(answers.elderly, 0);
  assert.equal(answers.isCompleted, false);
});

test('household endpoint schema accepts partial drafts and rejects incomplete completion submissions', async (t) => {
  const app = Fastify();
  app.post('/households', {
    preValidation: validateAnimalEmploymentAnswer,
    schema: { body: householdSubmissionEnvelopeSchema }
  }, async (request) => request.body);
  await app.ready();
  t.after(() => app.close());

  const draft = await app.inject({
    method: 'POST',
    url: '/households',
    payload: {
      villageName: 'Test village',
      houseNumber: 1,
      data: { headName: 'Draft household', isCompleted: false, completedSections: 1 }
    }
  });

  assert.equal(draft.statusCode, 200);

  const invalidMemberCounts = await Promise.all(['', '0', '1.5', 0, 1.5].map((totalMembers) => app.inject({
    method: 'POST',
    url: '/households',
    payload: {
      villageName: 'Test village',
      houseNumber: 1,
      data: { totalMembers }
    }
  })));
  assert.ok(invalidMemberCounts.every((response) => response.statusCode === 400));

  const animalEmploymentAnswers = await Promise.all(
    ['', 'हाँ', 'नहीं', 'पात्रता नहीं'].map((animalEmployment) => app.inject({
      method: 'POST',
      url: '/households',
      payload: {
        villageName: 'Test village',
        houseNumber: 1,
        data: { animalEmployment }
      }
    }))
  );
  assert.ok(animalEmploymentAnswers.every((response) => response.statusCode === 200));

  const invalidAnimalEmploymentAnswers = await Promise.all(
    ['Maybe', ' पात्रता नहीं ', null, 1].map((animalEmployment) => app.inject({
      method: 'POST',
      url: '/households',
      payload: {
        villageName: 'Test village',
        houseNumber: 1,
        data: { animalEmployment }
      }
    }))
  );
  assert.deepEqual(
    invalidAnimalEmploymentAnswers.map((response) => response.statusCode),
    [400, 400, 400, 400],
    JSON.stringify(invalidAnimalEmploymentAnswers.map((response) => response.body))
  );

  const validMemberCount = await app.inject({
    method: 'POST',
    url: '/households',
    payload: {
      villageName: 'Test village',
      houseNumber: 1,
      data: { totalMembers: '0004' }
    }
  });
  assert.equal(validMemberCount.statusCode, 200);

  const incompleteCompletion = await app.inject({
    method: 'POST',
    url: '/households',
    payload: {
      villageName: 'Test village',
      houseNumber: 1,
      data: { headName: 'Incomplete household', isCompleted: true }
    }
  });
  assert.equal(incompleteCompletion.statusCode, 400);
});

test('household count initialization accepts village IDs and zero, but rejects invalid counts', async (t) => {
  const app = Fastify();
  app.post('/households/initialize', {
    schema: { body: householdSlotInitializationSchema }
  }, async (request) => request.body);
  await app.ready();
  t.after(() => app.close());

  const zeroCount = await app.inject({
    method: 'POST',
    url: '/households/initialize',
    payload: { villageId: 12, block: 'Block', panchayat: 'Panchayat', count: 0 }
  });
  assert.equal(zeroCount.statusCode, 200);

  const legacyNonNumericId = await app.inject({
    method: 'POST',
    url: '/households/initialize',
    payload: {
      villageId: 'NaN',
      villageName: 'Test village',
      block: 'Block',
      panchayat: 'Panchayat',
      count: 1
    }
  });
  assert.equal(legacyNonNumericId.statusCode, 200);

  const overLimit = await app.inject({
    method: 'POST',
    url: '/households/initialize',
    payload: { villageId: 12, block: 'Block', panchayat: 'Panchayat', count: 5001 }
  });
  assert.equal(overLimit.statusCode, 400);
});
