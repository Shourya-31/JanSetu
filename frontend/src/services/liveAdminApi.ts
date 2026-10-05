import type {
  AuditFlag,
  AuditLogEntry,
  HouseholdRecord,
  LocationFilters,
  RegistryStatus,
  SchemeGapStat,
  VerificationResult,
  VillageRecord
} from '../types/admin';
import { apiRequest } from './apiClient';

interface AdminQueryRow {
  villageName: string;
  houseNumber: number;
  data: Record<string, unknown>;
}

interface AuditApiRow {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changedBy: string | null;
  timestamp: string;
  changes: Record<string, unknown>;
  user?: { userCode: string; fullName: string } | null;
}

const text = (value: unknown, fallback = ''): string => typeof value === 'string' ? value : fallback;
const count = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function mapHousehold(row: AdminQueryRow): HouseholdRecord {
  const data = row.data;
  const noBirthCertificate = count(data.childrenWithoutBirthCertificate);
  return {
    id: text(data.id),
    trackingId: text(data.trackingId, text(data.id)),
    houseNumber: count(data.houseNumber ?? row.houseNumber),
    villageName: text(data.villageName, row.villageName),
    panchayat: text(data.panchayat, text(data.panchayatName)),
    block: text(data.block, text(data.blockName)),
    headName: text(data.headName),
    mobile: text(data.mobile),
    caste: text(data.caste),
    isBPL: text(data.isBPL, text(data.isBpl)),
    totalMembers: count(data.totalMembers),
    eldersCount: count(data.eldersCount ?? data.elderly),
    childrenCount: count(data.childrenCount ?? data.children),
    unemployedCount: count(data.unemployedCount ?? data.unemployedMembers),
    incomeSource: text(data.incomeSource, text(data.mainIncomeSource)),
    missingAadhaar: count(data.missingAadhaar ?? data.noAadhaarMembers),
    missingCasteCert: count(data.missingCasteCert ?? data.noCasteCertificateMembers),
    missingAyushman: count(data.missingAyushman ?? data.noAyushmanMembers),
    missingVoterId: count(data.missingVoterId ?? data.noVoterIdMembers),
    hasRationCard: text(data.hasRationCard, text(data.rationCard)),
    hasMNREGA: text(data.hasMNREGA, text(data.mnregaJobCard)),
    hasShramikCard: text(data.hasShramikCard, text(data.noShramikCardMembers)),
    hasJanDhan: text(data.hasJanDhan, text(data.janDhanAccount)),
    hasKCC: text(data.hasKCC, text(data.kcc)),
    hasFreeRation: text(data.hasFreeRation, text(data.pmGaribKalyanRation)),
    hasPMKisan: text(data.hasPMKisan, text(data.pmKisan)),
    jsyReceived: text(data.jsyReceived, text(data.jsy)),
    pmmvyReceived: text(data.pmmvyReceived, text(data.pmmvy)),
    mahtariVandana: text(data.mahtariVandana),
    widowPension: text(data.widowPension),
    divyangPension: text(data.divyangPension, text(data.disabilityPension)),
    hasBirthCert: text(data.hasBirthCert, noBirthCertificate > 0 ? 'नहीं' : 'हां'),
    childrenVaccinated: text(data.childrenVaccinated, text(data.vaccinationStatus)),
    hotMealAWC: text(data.hotMealAWC, text(data.anganwadiMeal)),
    childrenGoSchool: text(data.childrenGoSchool, text(data.childrenSchoolStatus)),
    isMiningWorker: text(data.isMiningWorker, text(data.miningEmployment)),
    houseType: text(data.houseType),
    hasGovtHousing: text(data.hasGovtHousing, text(data.housingSchemeBenefit)),
    hasToilet: text(data.hasToilet, text(data.toiletStatus)),
    hasTapWater: text(data.hasTapWater, text(data.tapWaterConnection)),
    waterSource: text(data.waterSource, text(data.drinkingWaterSource)),
    hasElectricity: text(data.hasElectricity, text(data.electricityConnection)),
    usesSolar: text(data.usesSolar, text(data.solarEnergy)),
    chronicIllness: text(data.chronicIllness, text(data.familyDisease)),
    freeMedicine: text(data.freeMedicine, text(data.freeMedicines)),
    submittedAt: text(data.submittedAt, new Date().toISOString()),
    auditStatus: text(data.auditStatus, 'लंबित') as HouseholdRecord['auditStatus'],
    registryStatus: text(data.registryStatus, 'लंबित') as RegistryStatus,
    verificationResult: text(data.verificationResult) as VerificationResult | undefined,
    auditNote: text(data.auditNote),
    verifiedBy: text(data.verifiedBy),
    verifiedAt: text(data.verifiedAt),
    correctionTicketId: text(data.correctionTicketId),
    correctionReason: text(data.correctionReason),
    correctionNote: text(data.correctionNote),
    correctionCreatedAt: text(data.correctionCreatedAt)
  };
}

export async function fetchVillages(filters: LocationFilters): Promise<VillageRecord[]> {
  const response = await apiRequest<Record<string, Record<string, unknown>>>('/api/villages/all');
  return Object.values(response).map((row) => ({
    id: text(row.id),
    block: text(row.block),
    panchayat: text(row.panchayat),
    villageName: text(row.villageName),
    totalPopulation: count(row.totalPopulation),
    totalHouseholds: count(row.totalHouseholds),
    scCount: count(row.scCount),
    stCount: count(row.stCount),
    puccaHouses: count(row.puccaHouses),
    semiPuccaHouses: count(row.semiPuccaHouses),
    kacchaHouses: count(row.kacchaHouses),
    mineDistanceKm: text(row.mineDistanceKm),
    hasPuccaRoad: text(row.hasPuccaRoad),
    monsoonCutOff: text(row.monsoonCutOff),
    schoolType: text(row.schoolType),
    hospitalType: text(row.hospitalType),
    electrification: text(row.electrification),
    hasAnganwadi: text(row.hasAnganwadi),
    odfStatus: text(row.odfStatus),
    gapMatrix: (row.gapMatrix || {}) as VillageRecord['gapMatrix'],
    surveyedHouseholds: count(row.surveyedHouseholds),
    completionPercent: count(row.completionPercent),
    updatedAt: text(row.updatedAt)
  })).filter((village) =>
    (!filters.block || village.block === filters.block) &&
    (!filters.panchayat || village.panchayat === filters.panchayat) &&
    (!filters.village || village.villageName === filters.village)
  );
}

export async function fetchHouseholds(
  filters: LocationFilters,
  opts?: { status?: 'सभी' | 'सत्यापित' | 'लंबित' | 'फ्लैग'; search?: string }
): Promise<HouseholdRecord[]> {
  const response = await apiRequest<AdminQueryRow[]>('/api/admin/query', {
    method: 'POST',
    body: {
      block: filters.block || undefined,
      panchayat: filters.panchayat || undefined,
      village: filters.village || undefined,
      houseNumber: filters.houseNumber ? Number(filters.houseNumber) : undefined,
      auditStatus: opts?.status && opts.status !== 'सभी' ? opts.status : undefined,
      searchQuery: opts?.search?.trim() || undefined
    }
  });
  return response.map(mapHousehold);
}

export async function fetchSchemeGapStats(filters: LocationFilters): Promise<SchemeGapStat[]> {
  const households = await fetchHouseholds(filters);
  const definitions: Array<{
    key: string;
    label: string;
    category: string;
    test: (household: HouseholdRecord) => boolean;
  }> = [
    { key: 'aadhaar', label: 'आधार कार्ड (Aadhaar)', category: 'दस्तावेज़', test: (h) => h.missingAadhaar > 0 },
    { key: 'caste', label: 'जाति प्रमाणपत्र (Caste Certificate)', category: 'दस्तावेज़', test: (h) => h.missingCasteCert > 0 },
    { key: 'ayushman', label: 'आयुष्मान (Ayushman)', category: 'दस्तावेज़', test: (h) => h.missingAyushman > 0 },
    { key: 'voter', label: 'मतदाता पहचान पत्र (Voter ID)', category: 'दस्तावेज़', test: (h) => h.missingVoterId > 0 },
    { key: 'ration', label: 'राशन कार्ड (Ration Card)', category: 'दस्तावेज़', test: (h) => ['नहीं', 'No'].includes(h.hasRationCard) },
    { key: 'mgnrega', label: 'मनरेगा (MGNREGA)', category: 'रोजगार', test: (h) => ['नहीं', 'No'].includes(h.hasMNREGA) },
    { key: 'shramik', label: 'श्रमिक कार्ड (Shramik Card)', category: 'रोजगार', test: (h) => ['नहीं', 'No'].includes(h.hasShramikCard) },
    { key: 'jan-dhan', label: 'जन-धन (Jan-Dhan)', category: 'वित्तीय समावेशन', test: (h) => ['नहीं', 'No'].includes(h.hasJanDhan) },
    { key: 'kcc', label: 'KCC', category: 'कृषि', test: (h) => ['नहीं', 'No'].includes(h.hasKCC) },
    { key: 'pm-kisan', label: 'PM-KISAN', category: 'कृषि', test: (h) => ['नहीं', 'No'].includes(h.hasPMKisan) },
    { key: 'jsy', label: 'जननी सुरक्षा योजना (JSY)', category: 'मातृ स्वास्थ्य', test: (h) => ['नहीं', 'No'].includes(h.jsyReceived) },
    { key: 'pmmvy', label: 'PMMVY', category: 'मातृ स्वास्थ्य', test: (h) => ['नहीं', 'No'].includes(h.pmmvyReceived) },
    { key: 'mahtari', label: 'महतारी वंदना (Mahtari Vandana)', category: 'कल्याण', test: (h) => ['नहीं', 'No'].includes(h.mahtariVandana) },
    { key: 'birth', label: 'जन्म प्रमाणपत्र (Birth Certificate)', category: 'नागरिक दस्तावेज़', test: (h) => ['नहीं', 'No'].includes(h.hasBirthCert) },
    { key: 'vaccination', label: 'बाल टीकाकरण (Child Vaccination)', category: 'बाल स्वास्थ्य', test: (h) => ['नहीं', 'No'].includes(h.childrenVaccinated) },
    { key: 'school', label: 'स्कूल उपस्थिति (School Attendance)', category: 'शिक्षा', test: (h) => ['नहीं', 'No'].includes(h.childrenGoSchool) },
    { key: 'toilet', label: 'शौचालय (Toilet)', category: 'स्वच्छता', test: (h) => ['नहीं', 'No'].includes(h.hasToilet) },
    { key: 'water', label: 'नल जल (Tap Water)', category: 'जल आपूर्ति', test: (h) => ['नहीं', 'No'].includes(h.hasTapWater) },
    { key: 'electricity', label: 'बिजली (Electricity)', category: 'ऊर्जा', test: (h) => ['नहीं', 'No'].includes(h.hasElectricity) }
  ];

  return definitions.map((item) => {
    const gapCount = households.filter(item.test).length;
    const gapPercent = households.length ? Math.round(gapCount / households.length * 100) : 0;
    return {
      key: item.key,
      label: item.label,
      category: item.category,
      gapPercent,
      gapCount,
      totalHouseholds: households.length,
      priority: (gapPercent >= 50 ? 'उच्च' : gapPercent >= 25 ? 'मध्यम' : 'निम्न') as SchemeGapStat['priority']
    };
  }).sort((left, right) => right.gapPercent - left.gapPercent);
}

export async function verifyHousehold(id: string, result: VerificationResult = 'सत्यापित'): Promise<HouseholdRecord | null> {
  const response = await apiRequest<{ success: boolean; data: Record<string, unknown> }>(`/api/households/${encodeURIComponent(id)}/verify`, {
    method: 'PATCH',
    body: { result }
  });
  return mapHousehold({ villageName: text(response.data.villageName), houseNumber: count(response.data.houseNumber), data: response.data });
}

export async function updateRegistryStatus(id: string, status: RegistryStatus): Promise<HouseholdRecord | null> {
  const response = await apiRequest<{ success: boolean; data: Record<string, unknown> }>(`/api/households/${encodeURIComponent(id)}/registry`, {
    method: 'PATCH',
    body: { status }
  });
  return mapHousehold({ villageName: text(response.data.villageName), houseNumber: count(response.data.houseNumber), data: response.data });
}

export async function sendCorrectionTicket(id: string, reason: string, note: string): Promise<{ success: boolean; ticketId?: string }> {
  const response = await apiRequest<{ success: boolean; ticketId: string }>(`/api/households/${encodeURIComponent(id)}/ticket`, {
    method: 'POST',
    body: { reason, note }
  });
  return { success: response.success, ticketId: response.ticketId };
}

export async function fetchAuditFlags(filters: LocationFilters): Promise<AuditFlag[]> {
  return (await fetchHouseholds(filters))
    .filter((household) => household.auditStatus === 'फ्लैग')
    .map((household) => ({
      id: household.correctionTicketId || household.id,
      householdId: household.id,
      village: household.villageName,
      houseNumber: household.houseNumber,
      headName: household.headName,
      reason: household.correctionReason || household.auditNote || 'प्रशासनिक समीक्षा आवश्यक',
      raisedAt: household.correctionCreatedAt || household.submittedAt,
      status: household.correctionTicketId ? 'टिकट भेजा गया' : 'लंबित'
    }));
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const response = await apiRequest<{ data: AuditApiRow[]; nextCursor: string | null }>('/api/admin/audit-logs?limit=100');
  return response.data.map((row) => {
    const changes = row.changes || {};
    const before = changes.before as Record<string, unknown> | null;
    const after = changes.after as Record<string, unknown> | null;
    const reason = text(changes.reason, row.action);
    const actionLabels: Record<string, string> = {
      created: 'सर्वेक्षण प्राप्त',
      updated: 'सर्वेक्षण संशोधन',
      deleted: 'रिकॉर्ड हटाया',
      verified: 'फील्ड सत्यापन',
      registry_status_changed: 'रजिस्ट्री स्थिति अपडेट',
      correction_ticket_created: 'सुधार टिकट'
    };
    return {
      id: row.id,
      timestamp: row.timestamp,
      actor: row.user?.fullName || row.user?.userCode || row.changedBy || 'System',
      action: actionLabels[row.action] || row.action,
      recordId: row.entityId,
      fromStatus: text(before?.registryStatus),
      toStatus: text(after?.registryStatus),
      message: `${row.entityType} · ${row.entityId} · ${reason}`
    };
  });
}
