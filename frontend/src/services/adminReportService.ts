import { apiRequest } from './apiClient';
import type {
  AdminAnalyticsSummary,
  AdminLocationBlock,
  AnalyticsScope,
  ReportScope,
  SurveyDataset,
} from "../types/adminReports";

export interface AdminReportService {
  loadHierarchy(signal: AbortSignal): Promise<AdminLocationBlock[]>;
  loadAnalytics(scope: AnalyticsScope, signal: AbortSignal): Promise<AdminAnalyticsSummary>;
  loadSurveys(scope: ReportScope, signal: AbortSignal): Promise<SurveyDataset>;
}

export const offlineAdminReportService: AdminReportService = {
  async loadHierarchy(signal) {
    signal.throwIfAborted();
    return [];
  },
  async loadAnalytics(_scope, signal) {
    signal.throwIfAborted();
    return {
      districts: 0,
      blocks: 0,
      gramPanchayats: 0,
      villages: 0,
      villageSurveysCompleted: 0,
      villageSurveysPending: 0,
      villageSurveysIncomplete: 0,
      villageSurveysUnavailable: 0,
      villageCompletionPercent: 0,
      householdRecords: 0,
      completedHouseholdRecords: 0,
      incompleteHouseholdRecords: 0,
      householdCompletionPercent: null,
      population: null,
      populationResponses: 0,
      totalHouseholds: null,
      householdTotalResponses: 0,
    };
  },
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
  async loadHierarchy(signal) {
    return apiRequest<AdminLocationBlock[]>('/api/admin/hierarchy', { signal });
  },
  async loadAnalytics(scope, signal) {
    const params = new URLSearchParams();
    if (scope.blockId) params.set('blockId', scope.blockId);
    if (scope.panchayatId) params.set('panchayatId', scope.panchayatId);
    if (scope.villageId) params.set('villageId', scope.villageId);
    const query = params.size ? `?${params.toString()}` : '';
    return apiRequest<AdminAnalyticsSummary>(`/api/admin/analytics${query}`, { signal });
  },
  async loadSurveys(scope, signal) {
    const params = new URLSearchParams({ blockId: scope.blockId });
    if (scope.panchayatId) params.set('panchayatId', scope.panchayatId);
    if (scope.villageId) params.set('villageId', scope.villageId);
    return apiRequest<SurveyDataset>(`/api/admin/surveys?${params.toString()}`, { signal });
  }
};
