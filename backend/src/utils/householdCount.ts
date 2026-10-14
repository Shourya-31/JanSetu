import type { HouseholdSurvey } from '@prisma/client';

const HOUSEHOLD_ANSWER_FIELDS: (keyof HouseholdSurvey)[] = [
  'headName',
  'mobile',
  'surveyDate',
  'surveyorName',
  'caste',
  'isBpl',
  'eldersCount',
  'childrenCount',
  'womenCount',
  'rationCard',
  'noAadhaarMembers',
  'aadhaarEkyc',
  'noCasteCertMembers',
  'noAyushmanMembers',
  'noVoterIdMembers',
  'mnregaJobCard',
  'noShramikCardMembers',
  'janDhanAccount',
  'bankName',
  'kcc',
  'forestRightsPatta',
  'marriageCertificate',
  'jsy',
  'pmmvy',
  'mahtariVandana',
  'widowPension',
  'disabilityPension',
  'needsAssistiveDevice',
  'assistanceTypes',
  'otherAssistance',
  'deathInLastYear',
  'deathCertificateReceived',
  'pmGaribKalyanRation',
  'childrenWithoutBirthCert',
  'vaccinationStatus',
  'anganwadiMeal',
  'childrenSchoolStatus',
  'schoolNotGoingReason',
  'otherSchoolReason',
  'unemployedMembers',
  'pmKisan',
  'miningEmployment',
  'annualIncome',
  'mainIncomeSource',
  'livestockSource',
  'otherLivestockSource',
  'animalEmployment',
  'houseType',
  'housingSchemeBenefit',
  'toiletStatus',
  'tapWaterConnection',
  'drinkingWaterSource',
  'electricityConnection',
  'solarEnergy',
  'familyDisease',
  'freeMedicines',
  'shgMember',
  'priorityNeed1',
  'priorityNeed2',
  'priorityNeed3',
  'eligibleSchemeNotReceived',
  'schemeBenefitName'
];

export function readExpectedHouseholdCount(surveyData: unknown): number | null {
  if (!surveyData || typeof surveyData !== 'object' || Array.isArray(surveyData)) return null;
  const count = (surveyData as Record<string, unknown>).householdSurveyCount;
  return Number.isInteger(count) && Number(count) >= 0 ? Number(count) : null;
}

export function hasSavedHouseholdAnswers(record: HouseholdSurvey): boolean {
  if (record.isCompleted || record.completedSections > 0) return true;
  return HOUSEHOLD_ANSWER_FIELDS.some((field) => {
    const value = record[field];
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return value !== 0;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && typeof value === 'boolean' && value;
  });
}

export function withExpectedHouseholdCount(surveyData: unknown, count: number): Record<string, unknown> {
  const existing = surveyData && typeof surveyData === 'object' && !Array.isArray(surveyData)
    ? surveyData as Record<string, unknown>
    : {};
  return { ...existing, householdSurveyCount: count };
}

export function preserveExpectedHouseholdCount(
  previousSurveyData: unknown,
  updatedSurveyData: Record<string, unknown>
): Record<string, unknown> {
  const count = readExpectedHouseholdCount(previousSurveyData);
  if (count === null) {
    const otherData = { ...updatedSurveyData };
    delete otherData.householdSurveyCount;
    return otherData;
  }
  return { ...updatedSurveyData, householdSurveyCount: count };
}
