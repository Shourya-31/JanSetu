import { getAuthSession } from './apiClient';
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

function getToken(): string {
  const session = getAuthSession();
  return session?.token || '';
}

export const liveAdminReportService: AdminReportService = {
  async loadSurveys(scope, signal) {
    const params = new URLSearchParams({ blockId: scope.blockId });
    if (scope.panchayatId) params.set('panchayatId', scope.panchayatId);
    if (scope.villageId) params.set('villageId', scope.villageId);
    
    const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
    
    const res = await fetch(`${API_BASE}/api/admin/surveys?${params.toString()}`, {
      signal,
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    
    if (!res.ok) {
      if (res.status === 401) throw new Error("आपकी लॉगिन अवधि समाप्त हो गई है, कृपया दोबारा लॉग इन करें। (Session Expired)");
      if (res.status === 404) throw new Error("डेटा उपलब्ध नहीं है या सर्वर से संपर्क नहीं हो सका।");
      throw new Error("सर्वर से डेटा लाने में समस्या हुई।");
    }
    
    return res.json();
  }
};
