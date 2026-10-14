import { apiRequest, ApiError } from './apiClient';
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
  villageId?: number;
  block: string;
  panchayat: string;
  villageName: string;
  version: number;
  villageSurvey: Record<string, unknown>;
  completedSections?: string[];
  progress?: number;
  isCompleted?: boolean;
  status?: string;
  [key: string]: unknown;
}

export function fetchHierarchy(): Promise<Block[]> {
  return apiRequest<Block[]>('/api/hierarchy');
}

export function fetchAllVillageProfiles(): Promise<Record<string, VillageApiProfile>> {
  return apiRequest<Record<string, VillageApiProfile>>('/api/villages/all');
}

export async function fetchVillageProfile(villageName: string, block?: string, panchayat?: string): Promise<VillageApiProfile | null> {
  if (!villageName) return null;
  try {
    const query = new URLSearchParams({ villageName });
    if (block) query.set('block', block);
    if (panchayat) query.set('panchayat', panchayat);
    return await apiRequest<VillageApiProfile>(`/api/villages/profile?${query.toString()}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchHouseholdSurveys(villageName: string): Promise<Record<string, HouseholdApiRecord>> {
  if (!villageName) return {};
  const res = await apiRequest<Record<string, HouseholdApiRecord> | { data?: Record<string, HouseholdApiRecord> }>(
    `/api/households?villageName=${encodeURIComponent(villageName)}`
  );
  if (!res || typeof res !== 'object' || Array.isArray(res)) {
    throw new Error('Household survey response was malformed');
  }
  const payload = res as Record<string, unknown>;
  if ('data' in payload) {
    if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
      throw new Error('Household survey response data was malformed');
    }
    return payload.data as Record<string, HouseholdApiRecord>;
  }
  return res as Record<string, HouseholdApiRecord>;
}

export function initializeHouseholdSlots(input: unknown): Promise<{ success: boolean; data: HouseholdApiRecord[] }> {
  return apiRequest<{ success: boolean; data: HouseholdApiRecord[] }>('/api/households/initialize', {
    method: 'POST',
    body: input
  });
}

export async function uploadVillagePhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const result = await apiRequest<{ secure_url?: string; url?: string }>('/api/upload/image', {
    method: 'POST',
    body: formData
  });
  const url = result.secure_url || result.url;
  if (!url) throw new Error('Image upload returned no URL');
  return url;
}

export function saveVillageSurvey(payload: Record<string, unknown>) {
  return apiRequest<{ success: boolean; data: VillageApiProfile }>('/api/villages/profile', {
    method: 'POST',
    body: payload
  });
}

export function finalizeVillageSurvey(villageId: number, version: number) {
  return apiRequest<{ success: boolean; data: Record<string, unknown> }>(`/api/villages/${villageId}/finalize`, {
    method: 'POST',
    body: { version }
  });
}

export function saveHouseholdSurvey(villageName: string, houseNumber: number, data: Record<string, unknown>) {
  return apiRequest<{ success: boolean; data: HouseholdApiRecord }>('/api/households', {
    method: 'POST',
    body: { villageName, houseNumber, data }
  });
}

export function updateHouseholdSurvey(id: string, version: number, data: Record<string, unknown>) {
  return apiRequest<{ success: boolean; data: HouseholdApiRecord }>(`/api/households/${id}`, {
    method: 'PATCH',
    body: { version, data }
  });
}
