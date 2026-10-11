import assert from 'node:assert/strict';
import test from 'node:test';
import {
  VILLAGE_SURVEY_SECTIONS,
  canFinalizeSurvey,
  normalizeCompletedSections,
  progressForSections
} from '../src/utils/villageSurveyProgress';

test('partial village saves retain only valid completed sections and calculate progress', () => {
  const sections = normalizeCompletedSections(['general', 'water', 'water', 'unknown']);
  assert.deepEqual(sections, ['general', 'water']);
  assert.equal(progressForSections(sections), 18);
});

test('a draft cannot be finalized before all required sections have saved data', () => {
  assert.equal(canFinalizeSurvey(['general'], { totalHouseholds: '2' }), false);
  assert.equal(canFinalizeSurvey(VILLAGE_SURVEY_SECTIONS, { totalHouseholds: '2' }), false);
});

test('a complete saved survey can be finalized and reaches 100 percent', () => {
  const data = {
    totalHouseholds: '2',
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
  };
  assert.equal(progressForSections(VILLAGE_SURVEY_SECTIONS), 100);
  assert.equal(canFinalizeSurvey(VILLAGE_SURVEY_SECTIONS, data), true);
});
