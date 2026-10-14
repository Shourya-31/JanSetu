import assert from 'node:assert/strict';
import test from 'node:test';
import type { HouseholdSurvey } from '@prisma/client';
import {
  hasSavedHouseholdAnswers,
  preserveExpectedHouseholdCount,
  readExpectedHouseholdCount,
  withExpectedHouseholdCount
} from '../src/utils/householdCount';

test('household count is persisted in and restored from existing survey JSON without replacing other data', () => {
  const persisted = withExpectedHouseholdCount({ totalHouseholds: 42, customSection: { saved: true } }, 125);

  assert.equal(readExpectedHouseholdCount(persisted), 125);
  assert.deepEqual(persisted, {
    totalHouseholds: 42,
    customSection: { saved: true },
    householdSurveyCount: 125
  });

  test('village profile and photo updates retain the stored household count', () => {
    const merged = preserveExpectedHouseholdCount(
      { householdSurveyCount: 125, existingField: 'keep' },
      {
        householdSurveyCount: 5,
        existingField: 'keep',
        villageDetail: 'updated',
        villagePhotos: ['photo-1', 'photo-2']
      }
    );

    assert.deepEqual(merged, {
      householdSurveyCount: 125,
      existingField: 'keep',
      villageDetail: 'updated',
      villagePhotos: ['photo-1', 'photo-2']
    });
  });
});

test('count zero is a persisted count, while malformed and missing counts remain absent', () => {
  assert.equal(readExpectedHouseholdCount(withExpectedHouseholdCount({}, 0)), 0);
  assert.equal(readExpectedHouseholdCount({ householdSurveyCount: -1 }), null);
  assert.equal(readExpectedHouseholdCount({ householdSurveyCount: '125' }), null);
  assert.equal(readExpectedHouseholdCount(null), null);
});

test('saved answers above a reduced count are detected and protected', () => {
  const partialHousehold = {
    houseNumber: 125,
    isCompleted: false,
    completedSections: 1,
    headName: 'Saved household'
  } as HouseholdSurvey;
  const blankRecord = {
    houseNumber: 125,
    isCompleted: false,
    completedSections: 0,
    headName: ''
  } as HouseholdSurvey;

  assert.equal(hasSavedHouseholdAnswers(partialHousehold), true);
  assert.equal(hasSavedHouseholdAnswers(blankRecord), false);
});
