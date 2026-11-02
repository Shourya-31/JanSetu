import { apiRequest } from "./apiClient";

export type SurveyAnalysisRecord = Record<string, unknown> & {
  id: number | string;
};

export type VillageSurveyAnalysisRecord = SurveyAnalysisRecord & {
  id: number;
  villageId: number;
  blockId: number;
  panchayatId: number;
  blockName: string;
  panchayatName: string;
  villageName: string;
  affectedStatus: string;
  data?: Record<string, unknown>;
};

export type HouseholdSurveyAnalysisRecord = SurveyAnalysisRecord & {
  id: string;
  blockId: number;
  panchayatId: number;
  villageId: number;
};

type AnalysisPage<T> = {
  records: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

async function fetchAllPages<T extends SurveyAnalysisRecord>(
  path: string,
  signal: AbortSignal,
): Promise<T[]> {
  const pageSize = 100;
  const first = await apiRequest<AnalysisPage<T>>(
    `${path}?page=1&pageSize=${pageSize}`,
    { signal },
  );
  if (!Array.isArray(first.records)
    || !Number.isSafeInteger(first.total)
    || first.total < 0
    || !Number.isSafeInteger(first.totalPages)
    || first.totalPages < 0) {
    throw new Error("The survey analysis API returned an invalid page.");
  }

  const records = [...first.records];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const result = await apiRequest<AnalysisPage<T>>(
      `${path}?page=${page}&pageSize=${pageSize}`,
      { signal },
    );
    if (!Array.isArray(result.records)) {
      throw new Error("The survey analysis API returned an invalid page.");
    }
    records.push(...result.records);
  }

  const uniqueRecords = new Map(records.map((record) => [String(record.id), record]));
  if (uniqueRecords.size !== records.length || records.length !== first.total) {
    throw new Error("The survey analysis results changed while they were loading. Retry the request.");
  }
  return Array.from(uniqueRecords.values());
}

export function fetchVillageSurveyAnalysis(signal: AbortSignal) {
  return fetchAllPages<VillageSurveyAnalysisRecord>(
    "/api/admin/survey-analysis/villages",
    signal,
  );
}

export function fetchHouseholdSurveyAnalysis(signal: AbortSignal) {
  return fetchAllPages<HouseholdSurveyAnalysisRecord>(
    "/api/admin/survey-analysis/households",
    signal,
  );
}
