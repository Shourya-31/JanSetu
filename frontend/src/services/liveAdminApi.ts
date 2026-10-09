import { apiRequest } from './apiClient';
import type { LocationFilters, VillageRecord, HouseholdRecord, SchemeGapStat, AuditLogEntry, AuditFlag, RegistryStatus, VerificationResult } from '../types/admin';

function encodeFilters(f: LocationFilters, extra?: Record<string, string>) {
  const q = new URLSearchParams();
  if (f.block) q.set('block', f.block);
  if (f.panchayat) q.set('panchayat', f.panchayat);
  if (f.village) q.set('village', f.village);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) if (v) q.set(k, v);
  }
  return q.toString();
}

export async function fetchVillages(filters: LocationFilters): Promise<VillageRecord[]> {
  try {
    const res = await apiRequest<{ data: VillageRecord[] }>(`/api/villages/all?${encodeFilters(filters)}`);
    return res.data || [];
  } catch {
    return [];
  }
}

export async function fetchHouseholds(filters: LocationFilters, opts?: { status?: string; search?: string }): Promise<HouseholdRecord[]> {
  try {
    const res = await apiRequest<{ data: HouseholdRecord[] }>(`/api/admin/query`, {
      method: 'POST',
      body: {
        ...filters,
        auditStatus: opts?.status,
        searchQuery: opts?.search
      }
    });
    return res.data || [];
  } catch {
    return [];
  }
}

export async function fetchSchemeGapStats(filters: LocationFilters): Promise<SchemeGapStat[]> {
  try {
    const res = await apiRequest<{ data: { schemes: SchemeGapStat[] } }>(`/api/admin/analytics`);
    return res.data?.schemes || [];
  } catch {
    return [];
  }
}

export async function verifyHousehold(id: string, result: VerificationResult = 'सत्यापित'): Promise<HouseholdRecord | null> {
  try {
    const res = await apiRequest<{ data: HouseholdRecord }>(`/api/households/${id}/verify`, {
      method: 'PATCH',
      body: { result }
    });
    return res.data;
  } catch {
    return null;
  }
}

export async function updateRegistryStatus(id: string, status: RegistryStatus): Promise<HouseholdRecord | null> {
  try {
    const res = await apiRequest<{ data: HouseholdRecord }>(`/api/households/${id}/registry`, {
      method: 'PATCH',
      body: { status }
    });
    return res.data;
  } catch {
    return null;
  }
}

export async function sendCorrectionTicket(id: string, reason: string, note: string): Promise<{ success: boolean; ticketId?: string }> {
  try {
    const res = await apiRequest<{ success: boolean; data: { correctionTicketId: string } }>(`/api/households/${id}/ticket`, {
      method: 'POST',
      body: { reason, note }
    });
    return { success: res.success, ticketId: res.data?.correctionTicketId };
  } catch {
    return { success: false };
  }
}

export async function fetchAuditFlags(filters: LocationFilters): Promise<AuditFlag[]> {
  try {
    const res = await apiRequest<{ data: { auditFlags: AuditFlag[] } }>(`/api/admin/analytics`);
    return res.data?.auditFlags || [];
  } catch {
    return [];
  }
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const res = await apiRequest<{ data: AuditLogEntry[] }>(`/api/admin/audit-logs?limit=50`);
    return res.data || [];
  } catch {
    return [];
  }
}
