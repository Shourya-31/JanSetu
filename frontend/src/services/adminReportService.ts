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


function getToken(): string {
  try {
    const raw = localStorage.getItem('jansetu_auth');
    if (!raw) return '';
    return JSON.parse(raw)?.token || '';
  } catch {
    return '';
  }
}

export const liveAdminReportService: AdminReportService = {
  async loadSurveys(scope, signal) {
    const params = new URLSearchParams({ blockId: scope.blockId });
    if (scope.panchayatId) params.set('panchayatId', scope.panchayatId);
    if (scope.villageId) params.set('villageId', scope.villageId);
    
    // Fallback to empty string for Vite proxy handling locally if no VITE_API_BASE_URL
    const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
    
    const res = await fetch(`${API_BASE}/api/admin/surveys?${params.toString()}`, {
      signal,
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    
    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }
    
    return res.json();
  }
};
