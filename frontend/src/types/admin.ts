// ============================================================================
// Admin module types
// ----------------------------------------------------------------------------
// These shapes mirror the survey payloads and add only the fields required by
// the admin workflow. Replace the mock data/API layer without changing the UI.
// ============================================================================

import type { VillageAction } from '../data/narayanpurHierarchy';

export interface GapMatrixRow {
  current: number;
  functional: number;
  nonFunctional: number;
  required: number;
  gap: number;
}

export interface VillageRecord {
  id: string;
  block: string;
  panchayat: string;
  villageName: string;
  affectedStatus: VillageAction;
  totalPopulation: number;
  totalHouseholds: number;
  scCount: number;
  stCount: number;
  puccaHouses: number;
  semiPuccaHouses: number;
  kacchaHouses: number;
  mineDistanceKm: string;
  hasPuccaRoad: string;
  monsoonCutOff: string;
  schoolType: string;
  hospitalType: string;
  electrification: string;
  hasAnganwadi: string;
  odfStatus: string;
  gapMatrix: Record<string, GapMatrixRow>;
  surveyedHouseholds: number;
  completionPercent: number;
  submittedBy?: string;
  updatedAt?: string;
}

export type AuditStatus = 'सत्यापित' | 'लंबित' | 'फ्लैग';
export type RegistryStatus = 'लंबित' | 'सत्यापित' | 'सुधार आवश्यक' | 'पुनः सत्यापन आवश्यक' | 'बंद';
export type VerificationResult = 'सत्यापित' | 'विसंगति मिली' | 'पुनः सत्यापन आवश्यक';

export interface HouseholdRecord {
  id: string;
  trackingId: string;
  houseNumber: number;
  villageName: string;
  panchayat: string;
  block: string;
  headName: string;
  mobile: string;
  caste: string;
  isBPL: string;
  totalMembers: number;
  eldersCount: number;
  childrenCount: number;
  unemployedCount: number;
  incomeSource: string;
  missingAadhaar: number;
  missingCasteCert: number;
  missingAyushman: number;
  missingVoterId: number;
  hasRationCard: string;
  hasMNREGA: string;
  hasShramikCard: string;
  hasJanDhan: string;
  hasKCC: string;
  hasFreeRation: string;
  hasPMKisan: string;
  jsyReceived: string;
  pmmvyReceived: string;
  mahtariVandana: string;
  widowPension: string;
  divyangPension: string;
  hasBirthCert: string;
  childrenVaccinated: string;
  hotMealAWC: string;
  childrenGoSchool: string;
  isMiningWorker: string;
  houseType: string;
  hasGovtHousing: string;
  hasToilet: string;
  hasTapWater: string;
  waterSource: string;
  hasElectricity: string;
  usesSolar: string;
  chronicIllness: string;
  freeMedicine: string;
  submittedAt: string;
  auditStatus: AuditStatus;
  registryStatus?: RegistryStatus;
  verificationResult?: VerificationResult;
  auditNote?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  correctionTicketId?: string;
  correctionReason?: string;
  correctionNote?: string;
  correctionCreatedAt?: string;
}

export interface AuditFlag {
  id: string;
  householdId: string;
  village: string;
  houseNumber: number;
  headName: string;
  reason: string;
  raisedAt: string;
  status: 'लंबित' | 'सत्यापित' | 'टिकट भेजा गया';
}

export interface SchemeGapStat {
  key: string;
  label: string;
  category: string;
  gapPercent: number;
  gapCount: number;
  totalHouseholds: number;
  priority: 'उच्च' | 'मध्यम' | 'निम्न';
}

export interface LocationFilters {
  district: string;
  // Children are intentionally blank until their parent is selected.
  block: string;
  panchayat: string;
  village: string;
  houseNumber: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  recordId?: string;
  fromStatus?: string;
  toStatus?: string;
  message: string;
}

export interface CorrectionTicket {
  id: string;
  householdId: string;
  reason: string;
  note: string;
  status: 'खुला' | 'बंद';
  createdAt: string;
  createdBy: string;
}
