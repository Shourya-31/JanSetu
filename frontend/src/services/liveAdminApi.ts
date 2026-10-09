import type { LocationFilters, VillageRecord, HouseholdRecord, SchemeGapStat, AuditLogEntry, AuditFlag, RegistryStatus, VerificationResult } from '../types/admin';
import type { Block } from '../data/narayanpurHierarchy';

export async function fetchVillages(filters: LocationFilters): Promise<VillageRecord[]> {
  // Disconnected from backend: returning mock data
  return [];
}

export async function fetchHouseholds(filters: LocationFilters, opts?: { status?: string; search?: string }): Promise<HouseholdRecord[]> {
  // Disconnected from backend: returning mock data
  return [];
}

export async function fetchSchemeGapStats(filters: LocationFilters): Promise<SchemeGapStat[]> {
  // Disconnected from backend: returning mock data
  return [];
}

export async function verifyHousehold(id: string, result: VerificationResult = 'सत्यापित'): Promise<HouseholdRecord | null> {
  // Disconnected
  return null;
}

export async function updateRegistryStatus(id: string, status: RegistryStatus): Promise<HouseholdRecord | null> {
  // Disconnected
  return null;
}

export async function sendCorrectionTicket(id: string, reason: string, note: string): Promise<{ success: boolean; ticketId?: string }> {
  // Disconnected
  return { success: true, ticketId: 'mock-ticket-123' };
}

export async function fetchAuditFlags(filters: LocationFilters): Promise<AuditFlag[]> {
  return [];
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  // Disconnected
  return [];
}
