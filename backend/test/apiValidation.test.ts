import assert from 'node:assert/strict';
import test from 'node:test';
import {
  VILLAGE_SURVEY_SECTIONS,
  canFinalizeSurvey,
  normalizeCompletedSections,
  progressForSections
} from '../src/utils/villageSurveyProgress';
import { mergePhotoUrls, normalizePhotoUrls } from '../src/utils/villagePhotos';

test('village photo batches append without duplicates and retain legacy single-photo values', () => {
  assert.deepEqual(
    mergePhotoUrls('https://cdn.example/one.jpg', ['https://cdn.example/one.jpg', ' https://cdn.example/two.jpg ']),
    ['https://cdn.example/one.jpg', 'https://cdn.example/two.jpg']
  );
  assert.deepEqual(normalizePhotoUrls('https://cdn.example/legacy.jpg'), ['https://cdn.example/legacy.jpg']);
});

test('a failed or omitted new photo batch cannot erase saved photos', () => {
  assert.deepEqual(
    mergePhotoUrls(['one', 'two'], undefined, []),
    ['one', 'two']
  );
});

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
