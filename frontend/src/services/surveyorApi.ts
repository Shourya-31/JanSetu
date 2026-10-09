import { apiRequest, getAuthSession } from './apiClient';
import type { Block } from '../data/narayanpurHierarchy';

export interface HouseholdApiRecord {
  id: string;
  trackingId: string;
  houseNumber: number;
  villageName: string;
  headName: string;
  version: number;
  auditStatus: string;
  registryStatus: string;
  surveyAnswers?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface VillageApiProfile {
  id: string;
  block: string;
  panchayat: string;
  villageName: string;
  version: number;
  villageSurvey: Record<string, unknown>;
  [key: string]: unknown;
}

export function fetchHierarchy(): Promise<Block[]> {
  return apiRequest<Block[]>('/api/hierarchy');
}

export async function fetchVillageProfile(villageName: string): Promise<VillageApiProfile | null> {
  try {
    return await apiRequest<VillageApiProfile>(`/api/villages/profile?villageName=${encodeURIComponent(villageName)}`);
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 404) return null;
    throw error;
  }
}

export function fetchHouseholdSurveys(villageName: string): Promise<Record<string, HouseholdApiRecord>> {
  return apiRequest<Record<string, HouseholdApiRecord>>(`/api/households?villageName=${encodeURIComponent(villageName)}`);
}

export function initializeHouseholdSlots(input: {
  villageName: string;
  block: string;
  panchayat: string;
  count: number;
}): Promise<{ success: boolean; data: HouseholdApiRecord[] }> {
  return apiRequest('/api/households/initialize', { method: 'POST', body: input });
}

export async function uploadVillagePhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const session = getAuthSession();
  
  const headers = new Headers();
  if (session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`);
  }

  const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}

export function saveVillageSurvey(payload: Record<string, unknown>) {
  return apiRequest<{ success: boolean; data: VillageApiProfile }>('/api/villages/profile', {
    method: 'POST',
    body: payload
  });
}

export function saveHouseholdSurvey(villageName: string, houseNumber: number, data: Record<string, unknown>) {
  return apiRequest<{ success: boolean; data: HouseholdApiRecord }>('/api/households', {
    method: 'POST',
    body: { villageName, houseNumber, data: { ...data, villageName, houseNumber } }
  });
}

export function updateHouseholdSurvey(id: string, version: number, data: Record<string, unknown>) {
  const countValue = (value: unknown, fallback = 0) => {
    const count = Number(value);
    return Number.isFinite(count) && count >= 0 ? count : fallback;
  };

  return apiRequest<{ success: boolean; data: HouseholdApiRecord }>(`/api/households/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: {
      version,
      headName: data.headName || 'Household Head',
      mobile: data.mobile || '',
      caste: data.caste || 'Scheduled Tribe (ST)',
      isBPL: data.isBPL || 'Yes',
      totalMembers: countValue(data.totalMembers, 1),
      eldersCount: countValue(data.eldersCount),
      childrenCount: countValue(data.childrenCount),
      unemployedCount: countValue(data.unemployedCount ?? data.unemployedMembers),
      incomeSource: data.incomeSource || data.mainIncomeSource || 'Agriculture',
      missingAadhaar: countValue(data.missingAadhaar ?? data.noAadhaarMembers),
      missingCasteCert: countValue(data.missingCasteCert ?? data.noCasteCertificateMembers),
      missingAyushman: countValue(data.missingAyushman ?? data.noAyushmanMembers),
      missingVoterId: countValue(data.missingVoterId ?? data.noVoterIdMembers),
      isMiningWorker: data.isMiningWorker || data.miningEmployment || 'No',
      houseType: data.houseType || 'Kaccha House',
      hasToilet: data.hasToilet || data.toiletStatus || 'No',
      hasTapWater: data.hasTapWater || data.tapWaterConnection || 'No',
      surveyAnswers: { ...data, version: undefined }
    }
  });
}
