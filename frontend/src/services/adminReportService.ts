import { apiRequest } from './apiClient';
import type { ReportScope, SurveyDataset } from "../types/adminReports";

export interface AdminReportService {
  loadSurveys(scope: ReportScope, signal: AbortSignal): Promise<SurveyDataset>;
}

export const offlineAdminReportService: AdminReportService = {
  async loadSurveys(_scope, signal) {
    signal.throwIfAborted();
    return {
      villageSurveys: [],
      householdSurveys: [],
      integrationPending: true,
    };
  },
};

export const liveAdminReportService: AdminReportService = {
  async loadSurveys(scope, signal) {
    const params = new URLSearchParams({ blockId: scope.blockId });
    if (scope.panchayatId) params.set('panchayatId', scope.panchayatId);
    if (scope.villageId) params.set('villageId', scope.villageId);
    return apiRequest<SurveyDataset>(`/api/admin/surveys?${params.toString()}`, { signal });
  }
};
