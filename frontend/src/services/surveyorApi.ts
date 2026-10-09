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
  return Promise.resolve([]);
}

export async function fetchVillageProfile(villageName: string): Promise<VillageApiProfile | null> {
  return null;
}

export function fetchHouseholdSurveys(villageName: string): Promise<Record<string, HouseholdApiRecord>> {
  return Promise.resolve({});
}

export function initializeHouseholdSlots(input: any): Promise<{ success: boolean; data: HouseholdApiRecord[] }> {
  return Promise.resolve({ success: true, data: [] });
}

export async function uploadVillagePhoto(file: File): Promise<string> {
  // Disconnected from backend - returning fake Cloudinary URL
  return 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
}

export function saveVillageSurvey(payload: Record<string, unknown>) {
  return Promise.resolve({ success: true, data: {} as VillageApiProfile });
}

export function saveHouseholdSurvey(villageName: string, houseNumber: number, data: Record<string, unknown>) {
  return Promise.resolve({ success: true, data: {} as HouseholdApiRecord });
}

export function updateHouseholdSurvey(id: string, version: number, data: Record<string, unknown>) {
  return Promise.resolve({ success: true, data: {} as HouseholdApiRecord });
}