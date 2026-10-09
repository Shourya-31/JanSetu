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
  if (!villageName) return null;
  try {
    const res = await apiRequest<{ data: VillageApiProfile }>(`/api/villages/profile?villageName=${encodeURIComponent(villageName)}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function fetchHouseholdSurveys(villageName: string): Promise<Record<string, HouseholdApiRecord>> {
  if (!villageName) return {};
  try {
    const res = await apiRequest<{ data: Record<string, HouseholdApiRecord> }>(`/api/households?villageName=${encodeURIComponent(villageName)}`);
    return res.data;
  } catch {
    return {};
  }
}

export function initializeHouseholdSlots(input: any): Promise<{ success: boolean; data: HouseholdApiRecord[] }> {
  return apiRequest<{ success: boolean; data: HouseholdApiRecord[] }>('/api/households/initialize', {
    method: 'POST',
    body: input
  });
}

export async function uploadVillagePhoto(file: File): Promise<string> {
  const session = getAuthSession();
  const formData = new FormData();
  formData.append('image', file);

  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';
  const headers: Record<string, string> = {};
  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const result = await response.json();
  return result.url;
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
    body: { villageName, houseNumber, data }
  });
}

export function updateHouseholdSurvey(id: string, version: number, data: Record<string, unknown>) {
  return apiRequest<{ success: boolean; data: HouseholdApiRecord }>(`/api/households/${id}`, {
    method: 'PATCH',
    body: { version, data }
  });
}
