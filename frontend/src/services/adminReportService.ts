import type { ReportScope, SurveyDataset } from "../types/adminReports";

/** Integration boundary, deliberately disconnected. Replace with a verified,
 * authorized adapter returning ALL pages; never return a partial report. */
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
