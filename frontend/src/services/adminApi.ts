import type {
  AuditFlag,
  AuditLogEntry,
  HouseholdRecord,
  LocationFilters,
  RegistryStatus,
  SchemeGapStat,
  VerificationResult,
  VillageRecord,
} from '../types/admin';
import { MOCK_HOUSEHOLDS, MOCK_VILLAGES, generateMockAuditFlags } from '../data/adminMockData';

const delay = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 100));
const isNo = (value: unknown) => value === false || value === 0 || value === 'नहीं' || value === 'No' || value === 'no';

function matches<T extends { block: string; panchayat: string; villageName?: string; houseNumber?: number }>(row: T, filters: LocationFilters) {
  if (filters.district && filters.district !== 'नारायणपुर') return false;
  if (filters.block && row.block !== filters.block) return false;
  if (filters.panchayat && row.panchayat !== filters.panchayat) return false;
  if (filters.village && row.villageName !== filters.village) return false;
  if (filters.houseNumber && String(row.houseNumber) !== filters.houseNumber) return false;
  return true;
}

export function fetchVillages(filters: LocationFilters): Promise<VillageRecord[]> {
  return delay(MOCK_VILLAGES.filter((v) => matches(v, filters)));
}

export function fetchHouseholds(
  filters: LocationFilters,
  opts?: { status?: 'सभी' | 'सत्यापित' | 'लंबित' | 'फ्लैग'; search?: string },
): Promise<HouseholdRecord[]> {
  let rows = MOCK_HOUSEHOLDS.filter((h) => matches(h, filters));
  if (opts?.status && opts.status !== 'सभी') rows = rows.filter((h) => h.auditStatus === opts.status);
  const q = opts?.search?.trim().toLowerCase();
  if (q) {
    rows = rows.filter((h) =>
      h.id.toLowerCase().includes(q) ||
      h.trackingId.toLowerCase().includes(q) ||
      h.headName.toLowerCase().includes(q) ||
      h.villageName.toLowerCase().includes(q) ||
      String(h.houseNumber).includes(q),
    );
  }
  return delay(rows);
}

export function fetchSchemeGapStats(filters: LocationFilters): Promise<SchemeGapStat[]> {
  const rows = MOCK_HOUSEHOLDS.filter((h) => matches(h, filters));
  const total = rows.length || 1;
  const definitions = [
    { key: 'aadhaar', label: 'आधार कार्ड (Aadhaar)', category: 'दस्तावेज़', test: (h: HouseholdRecord) => h.missingAadhaar > 0 },
    { key: 'caste', label: 'जाति प्रमाणपत्र (Caste Certificate)', category: 'दस्तावेज़', test: (h: HouseholdRecord) => h.missingCasteCert > 0 },
    { key: 'ayushman', label: 'आयुष्मान (Ayushman)', category: 'दस्तावेज़', test: (h: HouseholdRecord) => h.missingAyushman > 0 },
    { key: 'voter', label: 'मतदाता पहचान पत्र (Voter ID)', category: 'दस्तावेज़', test: (h: HouseholdRecord) => h.missingVoterId > 0 },
    { key: 'ration', label: 'राशन कार्ड (Ration Card)', category: 'खाद्य सुरक्षा', test: (h: HouseholdRecord) => isNo(h.hasRationCard) },
    { key: 'mgnrega', label: 'मनरेगा (MGNREGA)', category: 'रोजगार', test: (h: HouseholdRecord) => isNo(h.hasMNREGA) },
    { key: 'shramik', label: 'श्रमिक कार्ड (Shramik Card)', category: 'रोजगार', test: (h: HouseholdRecord) => isNo(h.hasShramikCard) },
    { key: 'jan-dhan', label: 'जन-धन (Jan-Dhan)', category: 'वित्तीय समावेशन', test: (h: HouseholdRecord) => isNo(h.hasJanDhan) },
    { key: 'kcc', label: 'KCC', category: 'कृषि', test: (h: HouseholdRecord) => isNo(h.hasKCC) },
    { key: 'pm-kisan', label: 'PM-KISAN', category: 'कृषि', test: (h: HouseholdRecord) => isNo(h.hasPMKisan) },
    { key: 'jsy', label: 'जननी सुरक्षा योजना (JSY)', category: 'मातृ स्वास्थ्य', test: (h: HouseholdRecord) => isNo(h.jsyReceived) },
    { key: 'pmmvy', label: 'PMMVY', category: 'मातृ स्वास्थ्य', test: (h: HouseholdRecord) => isNo(h.pmmvyReceived) },
    { key: 'mahtari', label: 'महतारी वंदना (Mahtari Vandana)', category: 'कल्याण', test: (h: HouseholdRecord) => isNo(h.mahtariVandana) },
    { key: 'birth', label: 'जन्म प्रमाणपत्र (Birth Certificate)', category: 'नागरिक दस्तावेज़', test: (h: HouseholdRecord) => isNo(h.hasBirthCert) },
    { key: 'vaccination', label: 'बाल टीकाकरण (Child Vaccination)', category: 'बाल स्वास्थ्य', test: (h: HouseholdRecord) => isNo(h.childrenVaccinated) },
    { key: 'school', label: 'स्कूल उपस्थिति (School Attendance)', category: 'शिक्षा', test: (h: HouseholdRecord) => isNo(h.childrenGoSchool) },
    { key: 'toilet', label: 'शौचालय (Toilet)', category: 'स्वच्छता', test: (h: HouseholdRecord) => isNo(h.hasToilet) },
    { key: 'water', label: 'नल जल (Tap Water)', category: 'जल आपूर्ति', test: (h: HouseholdRecord) => isNo(h.hasTapWater) },
    { key: 'electricity', label: 'बिजली (Electricity)', category: 'ऊर्जा', test: (h: HouseholdRecord) => isNo(h.hasElectricity) },
  ];

  return delay(definitions.map((item) => {
    const gapCount = rows.filter(item.test).length;
    const gapPercent = Math.round((gapCount / total) * 100);
    return {
      key: item.key,
      label: item.label,
      category: item.category,
      gapPercent,
      gapCount,
      totalHouseholds: rows.length,
      priority: gapPercent >= 50 ? 'उच्च' : gapPercent >= 25 ? 'मध्यम' : 'निम्न',
    } as SchemeGapStat;
  }).sort((a, b) => b.gapPercent - a.gapPercent));
}

export function verifyHousehold(id: string, result: VerificationResult = 'सत्यापित', actor = 'Block Auditor'): Promise<HouseholdRecord | null> {
  const row = MOCK_HOUSEHOLDS.find((h) => h.id === id);
  if (row) {
    row.verificationResult = result;
    row.verifiedBy = actor;
    row.verifiedAt = new Date().toISOString();
    row.auditStatus = result === 'सत्यापित' ? 'सत्यापित' : 'फ्लैग';
    row.registryStatus = result === 'सत्यापित' ? 'सत्यापित' : result === 'विसंगति मिली' ? 'सुधार आवश्यक' : 'पुनः सत्यापन आवश्यक';
  }
  return delay(row ?? null);
}

export function updateRegistryStatus(id: string, status: RegistryStatus): Promise<HouseholdRecord | null> {
  const row = MOCK_HOUSEHOLDS.find((h) => h.id === id);
  if (row) {
    row.registryStatus = status;
    if (status === 'सत्यापित') row.auditStatus = 'सत्यापित';
    if (status === 'सुधार आवश्यक' || status === 'पुनः सत्यापन आवश्यक') row.auditStatus = 'फ्लैग';
    if (status === 'बंद') row.auditStatus = 'सत्यापित';
  }
  return delay(row ?? null);
}

export function sendCorrectionTicket(id: string, reason: string, note: string, actor = 'Block Auditor'): Promise<{ success: boolean; ticketId?: string }> {
  const row = MOCK_HOUSEHOLDS.find((h) => h.id === id);
  if (!row) return delay({ success: false });
  const ticketId = `CT-${Date.now()}`;
  row.correctionTicketId = ticketId;
  row.correctionReason = reason;
  row.correctionNote = note;
  row.correctionCreatedAt = new Date().toISOString();
  row.auditNote = `${reason}${note ? `: ${note}` : ''}`;
  row.registryStatus = 'सुधार आवश्यक';
  row.auditStatus = 'फ्लैग';
  void actor;
  return delay({ success: true, ticketId });
}

export function fetchAuditFlags(filters: LocationFilters): Promise<AuditFlag[]> {
  return delay(generateMockAuditFlags(MOCK_HOUSEHOLDS.filter((h) => matches(h, filters))));
}

export function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  return delay([]);
}
