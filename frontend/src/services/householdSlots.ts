import type { HouseholdApiRecord } from './surveyorApi';

export interface HouseholdSlot {
  id?: string;
  version?: number;
  houseNumber: number;
  isCompleted: boolean;
  headName: string;
  data: Record<string, unknown>;
}

export function buildHouseholdSlots(
  villageName: string,
  blockName: string,
  panchayatName: string,
  surveyorName: string,
  count: number,
  savedHouseholds: Record<string, HouseholdApiRecord>
): HouseholdSlot[] {
  return Array.from({ length: count }, (_, index) => {
    const houseNumber = index + 1;
    const saved = savedHouseholds[String(houseNumber)];
    const surveyAnswers = saved?.surveyAnswers && typeof saved.surveyAnswers === 'object'
      ? saved.surveyAnswers
      : {};
    const headName = typeof surveyAnswers.headName === 'string'
      ? surveyAnswers.headName
      : typeof saved?.headName === 'string'
        ? saved.headName
        : '';

    return {
      id: saved?.id ?? `local-${villageName}-${houseNumber}`,
      version: Number(saved?.version ?? 1),
      houseNumber,
      headName,
      isCompleted: Boolean(saved?.isCompleted ?? saved?.auditStatus === 'Verified'),
      data: {
        ...surveyAnswers,
        villageName,
        block: blockName,
        panchayat: panchayatName,
        houseNumber,
        surveyorName
      }
    };
  });
}
