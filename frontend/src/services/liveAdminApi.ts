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
  const res = await apiRequest<{ data: VillageRecord[] }>(`/api/villages/all?${encodeFilters(filters)}`);
  return res.data || [];
}

export async function fetchHouseholds(filters: LocationFilters, opts?: { status?: string; search?: string }): Promise<HouseholdRecord[]> {
  const res = await apiRequest<{ data: HouseholdRecord[] }>('/api/admin/query', {
    method: 'POST',
    body: { ...filters, auditStatus: opts?.status, searchQuery: opts?.search }
  });
  return res.data || [];
}

export async function fetchSchemeGapStats(filters: LocationFilters): Promise<SchemeGapStat[]> {
  void filters;
  const res = await apiRequest<{ data: { schemes: SchemeGapStat[] } }>('/api/admin/analytics');
  return res.data?.schemes || [];
}

export async function verifyHousehold(id: string, result: VerificationResult = 'सत्यापित'): Promise<HouseholdRecord | null> {
  const res = await apiRequest<{ data: HouseholdRecord }>(`/api/households/${id}/verify`, {
    method: 'PATCH',
    body: { result }
  });
  return res.data;
}

export async function updateRegistryStatus(id: string, status: RegistryStatus): Promise<HouseholdRecord | null> {
  const res = await apiRequest<{ data: HouseholdRecord }>(`/api/households/${id}/registry`, {
    method: 'PATCH',
    body: { status }
  });
  return res.data;
}

export async function sendCorrectionTicket(id: string, reason: string, note: string): Promise<{ success: boolean; ticketId?: string }> {
  const res = await apiRequest<{ success: boolean; data: { correctionTicketId: string } }>(`/api/households/${id}/ticket`, {
    method: 'POST',
    body: { reason, note }
  });
  return { success: res.success, ticketId: res.data?.correctionTicketId };
}

export async function fetchAuditFlags(filters: LocationFilters): Promise<AuditFlag[]> {
  void filters;
  const res = await apiRequest<{ data: { auditFlags: AuditFlag[] } }>('/api/admin/analytics');
  return res.data?.auditFlags || [];
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await apiRequest<{ data: AuditLogEntry[] }>('/api/admin/audit-logs?limit=50');
  return res.data || [];
}
