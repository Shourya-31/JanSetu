import { describe, expect, it } from 'vitest';
import { buildHouseholdSlots } from './householdSlots';
import type { HouseholdApiRecord } from './surveyorApi';

describe('buildHouseholdSlots', () => {
  it('creates all 125 blank entries when the expected count has no saved records', () => {
    const slots = buildHouseholdSlots('Village', 'Block', 'Panchayat', 'Surveyor', 125, {});

    expect(slots).toHaveLength(125);
    expect(slots[0]).toMatchObject({ houseNumber: 1, headName: '', data: {} });
    expect(slots[124]).toMatchObject({ houseNumber: 125, headName: '', data: {} });
  });

  it('restores a partial saved household in its stable numbered slot without hiding blanks', () => {
    const saved = {
      id: 'village-record-17',
      trackingId: 'tracking-17',
      houseNumber: 17,
      villageName: 'Village',
      headName: 'Saved head',
      version: 3,
      auditStatus: 'Draft',
      registryStatus: 'Draft',
      surveyAnswers: { headName: 'Saved head', completedSections: 2 }
    } satisfies HouseholdApiRecord;

    const slots = buildHouseholdSlots('Village', 'Block', 'Panchayat', 'Surveyor', 125, { 17: saved });

    expect(slots).toHaveLength(125);
    expect(slots[16]).toMatchObject({
      id: 'village-record-17',
      version: 3,
      houseNumber: 17,
      headName: 'Saved head',
      data: { headName: 'Saved head', completedSections: 2 }
    });
    expect(slots[15].data.headName).toBeUndefined();
    expect(slots[124].houseNumber).toBe(125);
  });

  it('keeps records isolated by the response for each village', () => {
    const firstVillage = buildHouseholdSlots('First', '', '', '', 1, {});
    const secondVillage = buildHouseholdSlots('Second', '', '', '', 2, {});

    expect(firstVillage).toHaveLength(1);
    expect(secondVillage).toHaveLength(2);
    expect(secondVillage[0].data.villageName).toBe('Second');
  });
});
