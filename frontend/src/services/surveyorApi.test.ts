import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchHouseholdSurveys, initializeHouseholdSlots, saveHouseholdSurvey } from './surveyorApi';
import type { HouseholdApiRecord } from './surveyorApi';

const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn()
}));

vi.mock('./apiClient', () => ({
  apiRequest: apiRequestMock,
  ApiError: class ApiError extends Error {}
}));

afterEach(() => {
  apiRequestMock.mockReset();
});

describe('fetchHouseholdSurveys', () => {
  it('includes the selected village name in the GET query', async () => {
    apiRequestMock.mockResolvedValue({ householdCount: 0, households: {} });

    await fetchHouseholdSurveys(' Village & Hamlet ', 12);

    expect(apiRequestMock).toHaveBeenCalledWith('/api/households?villageName=Village+%26+Hamlet&villageId=12');
  });

  it('uses block and panchayat names instead of a non-numeric local hierarchy ID', async () => {
    apiRequestMock.mockResolvedValue({ householdCount: 2, households: {} });

    await fetchHouseholdSurveys('Village', undefined, 'Block', 'Panchayat');

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/api/households?villageName=Village&block=Block&panchayat=Panchayat'
    );
  });

  it('never serializes a non-numeric hierarchy ID as villageId=NaN', async () => {
    apiRequestMock.mockResolvedValue({ householdCount: 0, households: {} });

    await fetchHouseholdSurveys('Village', Number('narayanpur-belgaon-belgaon'));

    expect(apiRequestMock).toHaveBeenCalledWith('/api/households?villageName=Village');
  });

  describe('initializeHouseholdSlots', () => {
    it('persists the requested count for the selected village and uses the confirmed response', async () => {
      const response = { success: true, householdCount: 125, households: {} };
      apiRequestMock.mockResolvedValue(response);
      const input = {
        villageId: 12,
        villageName: 'Village',
        block: 'Block',
        panchayat: 'Panchayat',
        count: 125
      };

      await expect(initializeHouseholdSlots(input)).resolves.toEqual(response);
      expect(apiRequestMock).toHaveBeenCalledWith('/api/households/initialize', {
        method: 'POST',
        body: input
      });
    });
  });

  it('does not request households when no village is selected', async () => {
    await expect(fetchHouseholdSurveys('   ')).resolves.toEqual({ householdCount: 0, households: {} });

    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it('returns saved household answers and progress for reopening', async () => {
    const savedRecord = {
      id: 'household-record-17',
      houseNumber: 17,
      version: 3,
      isCompleted: false,
      surveyAnswers: {
        headName: 'Saved head',
        mobile: '9876543210',
        completedSections: 2
      }
    };
    apiRequestMock.mockResolvedValue({ householdCount: 125, households: { 17: savedRecord } });

    await expect(fetchHouseholdSurveys('Village', 4)).resolves.toEqual({
      householdCount: 125,
      households: { 17: savedRecord }
    });
    expect(apiRequestMock).toHaveBeenCalledWith('/api/households?villageName=Village&villageId=4');
  });

  it('supports legacy records-only responses by inferring the highest saved household number', async () => {
    const savedRecord = { id: 'record-17', houseNumber: 17 } as HouseholdApiRecord;
    apiRequestMock.mockResolvedValue({ 17: savedRecord });

    await expect(fetchHouseholdSurveys('Village')).resolves.toEqual({
      householdCount: 17,
      households: { 17: savedRecord }
    });
  });

  it('saves draft data against the selected village and house number', async () => {
    const response = { success: true, data: { id: 'household-record-17' } };
    apiRequestMock.mockResolvedValue(response);
    const draft = {
      headName: 'Draft head',
      completedSections: 1,
      isCompleted: false,
      block: 'Block',
      panchayat: 'Panchayat'
    };

    await expect(saveHouseholdSurvey('Village', 17, draft, 4)).resolves.toEqual(response);
    expect(apiRequestMock).toHaveBeenCalledWith('/api/households', {
      method: 'POST',
      body: {
        villageName: 'Village',
        villageId: 4,
        block: 'Block',
        panchayat: 'Panchayat',
        houseNumber: 17,
        data: draft
      }
    });
  });

  it('propagates failed save responses so the form can retain the draft for retry', async () => {
    const failure = new Error('Temporary save failure');
    apiRequestMock.mockRejectedValue(failure);

    await expect(saveHouseholdSurvey('Village', 17, { headName: 'Keep this draft' })).rejects.toBe(failure);
    expect(apiRequestMock).toHaveBeenCalledOnce();
  });
});
