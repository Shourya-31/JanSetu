import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateStatisticalBlockMetrics } from '../src/utils/statisticalAnalysis';
import { VILLAGE_AFFECTED_STATUS } from '../src/utils/villageAffectedStatus';

test('assigns Both exclusively to Direct and excludes Unaffected and invalid statuses', () => {
  const result = calculateStatisticalBlockMetrics([
    { id: 1, affectedStatus: VILLAGE_AFFECTED_STATUS.DIRECT, villageSurvey: null, households: [] },
    { id: 2, affectedStatus: VILLAGE_AFFECTED_STATUS.BOTH, villageSurvey: null, households: [] },
    { id: 3, affectedStatus: VILLAGE_AFFECTED_STATUS.INDIRECT, villageSurvey: null, households: [] },
    { id: 4, affectedStatus: VILLAGE_AFFECTED_STATUS.UNAFFECTED, villageSurvey: null, households: [] },
    { id: 5, affectedStatus: 'Unknown', villageSurvey: null, households: [] }
  ]);

  assert.equal(result.totalVillages, 5);
  assert.equal(result.directVillageCount, 2);
  assert.equal(result.indirectVillageCount, 1);
  assert.equal(result.unclassifiedVillages, 1);
  assert.equal(result.totalVillages - result.directVillageCount - result.indirectVillageCount - result.unclassifiedVillages, 1);
});

test('counts distinct village IDs once and uses finalized survey status and eligible household rows', () => {
  const result = calculateStatisticalBlockMetrics([
    {
      id: 1,
      affectedStatus: VILLAGE_AFFECTED_STATUS.DIRECT,
      villageSurvey: { isCompleted: true },
      households: [{ isCompleted: true }, { isCompleted: false }]
    },
    {
      id: 2,
      affectedStatus: VILLAGE_AFFECTED_STATUS.BOTH,
      villageSurvey: { isCompleted: true },
      households: [{ isCompleted: true }]
    },
    {
      id: 3,
      affectedStatus: VILLAGE_AFFECTED_STATUS.INDIRECT,
      villageSurvey: { isCompleted: false },
      households: [{ isCompleted: false }, { isCompleted: false }]
    },
    {
      id: 4,
      affectedStatus: VILLAGE_AFFECTED_STATUS.UNAFFECTED,
      villageSurvey: { isCompleted: true },
      households: [{ isCompleted: true }]
    },
    {
      id: 5,
      affectedStatus: 'Unknown',
      villageSurvey: null,
      households: []
    },
    {
      id: 1,
      affectedStatus: VILLAGE_AFFECTED_STATUS.DIRECT,
      villageSurvey: { isCompleted: true },
      households: [{ isCompleted: true }, { isCompleted: false }]
    }
  ]);

  assert.equal(result.totalVillages, 5);
  assert.equal(result.directVillageCount, 2);
  assert.equal(result.directVillageSurveysCompleted, 2);
  assert.equal(result.indirectVillageCount, 1);
  assert.equal(result.indirectVillageSurveysCompleted, 0);
  assert.equal(result.directHouseholdInput, 3);
  assert.equal(result.directHouseholdCompleted, 2);
  assert.equal(result.indirectHouseholdInput, 2);
  assert.equal(result.indirectHouseholdCompleted, 0);
  assert.equal(result.directVillageHouseholdCompletionPercentSum, 150);
  assert.equal(result.directVillageHouseholdCompletionPercentCount, 2);
  assert.equal(result.indirectVillageHouseholdCompletionPercentSum, 0);
  assert.equal(result.indirectVillageHouseholdCompletionPercentCount, 1);
});

test('keeps zero-denominator household and survey totals at zero', () => {
  const result = calculateStatisticalBlockMetrics([
    { id: 1, affectedStatus: VILLAGE_AFFECTED_STATUS.DIRECT, villageSurvey: null, households: [] },
    { id: 2, affectedStatus: VILLAGE_AFFECTED_STATUS.INDIRECT, villageSurvey: null, households: [] }
  ]);

  assert.equal(result.directVillageCount, 1);
  assert.equal(result.indirectVillageCount, 1);
  assert.equal(result.directVillageSurveysCompleted, 0);
  assert.equal(result.indirectVillageSurveysCompleted, 0);
  assert.equal(result.directHouseholdInput, 0);
  assert.equal(result.directVillageHouseholdCompletionPercentCount, 0);
  assert.equal(result.indirectHouseholdInput, 0);
  assert.equal(result.indirectVillageHouseholdCompletionPercentCount, 0);
});

test('checked-in source retains the four official classification totals', () => {
  const source = require('../src/data/officialVillageAffectedAreas2026.json') as {
    entryCount: number;
    entries: { serial: number; officialStatus: string }[];
  };
  const counts = source.entries.reduce<Record<string, number>>((result, entry) => {
    result[entry.officialStatus] = (result[entry.officialStatus] ?? 0) + 1;
    return result;
  }, {});

  assert.equal(source.entryCount, 413);
  assert.equal(new Set(source.entries.map((entry) => entry.serial)).size, 413);
  assert.deepEqual(counts, {
    'प्रत्यक्ष प्रभावित': 130,
    'प्रत्यक्ष एवं अप्रत्यक्ष दोनों': 31,
    'अप्रत्यक्ष प्रभावित': 129,
    'अप्रभावित': 123
  });
});
