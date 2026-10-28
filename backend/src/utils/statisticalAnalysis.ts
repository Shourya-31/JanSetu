import { VILLAGE_AFFECTED_STATUS } from './villageAffectedStatus';

export type StatisticalVillage = {
  id: number;
  affectedStatus: string;
  villageSurvey: { isCompleted: boolean } | null;
  households: { isCompleted: boolean }[];
};

export type StatisticalBlockMetrics = {
  totalVillages: number;
  unclassifiedVillages: number;
  directVillageCount: number;
  directVillageSurveysCompleted: number;
  indirectVillageCount: number;
  indirectVillageSurveysCompleted: number;
  directHouseholdInput: number;
  directHouseholdCompleted: number;
  directVillageHouseholdCompletionPercentSum: number;
  directVillageHouseholdCompletionPercentCount: number;
  indirectHouseholdInput: number;
  indirectHouseholdCompleted: number;
  indirectVillageHouseholdCompletionPercentSum: number;
  indirectVillageHouseholdCompletionPercentCount: number;
};

function isDirect(status: string): boolean {
  return status === VILLAGE_AFFECTED_STATUS.DIRECT
    || status === VILLAGE_AFFECTED_STATUS.BOTH;
}

function isIndirect(status: string): boolean {
  return status === VILLAGE_AFFECTED_STATUS.INDIRECT;
}

function isClassified(status: string): boolean {
  return isDirect(status)
    || isIndirect(status)
    || status === VILLAGE_AFFECTED_STATUS.UNAFFECTED;
}

export function calculateStatisticalBlockMetrics(villages: StatisticalVillage[]): StatisticalBlockMetrics {
  const distinctVillages = [...new Map(villages.map((village) => [village.id, village])).values()];
  const metrics: StatisticalBlockMetrics = {
    totalVillages: distinctVillages.length,
    unclassifiedVillages: 0,
    directVillageCount: 0,
    directVillageSurveysCompleted: 0,
    indirectVillageCount: 0,
    indirectVillageSurveysCompleted: 0,
    directHouseholdInput: 0,
    directHouseholdCompleted: 0,
    directVillageHouseholdCompletionPercentSum: 0,
    directVillageHouseholdCompletionPercentCount: 0,
    indirectHouseholdInput: 0,
    indirectHouseholdCompleted: 0,
    indirectVillageHouseholdCompletionPercentSum: 0,
    indirectVillageHouseholdCompletionPercentCount: 0
  };

  for (const village of distinctVillages) {
    const direct = isDirect(village.affectedStatus);
    const indirect = isIndirect(village.affectedStatus);
    const surveyCompleted = village.villageSurvey?.isCompleted === true;
    const householdInput = village.households.length;
    const householdCompleted = village.households.filter((household) => household.isCompleted).length;
    const villageHouseholdCompletion = householdInput > 0
      ? householdCompleted / householdInput * 100
      : null;

    if (!isClassified(village.affectedStatus)) metrics.unclassifiedVillages += 1;

    if (direct) {
      metrics.directVillageCount += 1;
      if (surveyCompleted) metrics.directVillageSurveysCompleted += 1;
      metrics.directHouseholdInput += householdInput;
      metrics.directHouseholdCompleted += householdCompleted;
      if (villageHouseholdCompletion !== null) {
        metrics.directVillageHouseholdCompletionPercentSum += villageHouseholdCompletion;
        metrics.directVillageHouseholdCompletionPercentCount += 1;
      }
    }

    if (indirect) {
      metrics.indirectVillageCount += 1;
      if (surveyCompleted) metrics.indirectVillageSurveysCompleted += 1;
      metrics.indirectHouseholdInput += householdInput;
      metrics.indirectHouseholdCompleted += householdCompleted;
      if (villageHouseholdCompletion !== null) {
        metrics.indirectVillageHouseholdCompletionPercentSum += villageHouseholdCompletion;
        metrics.indirectVillageHouseholdCompletionPercentCount += 1;
      }
    }
  }

  return metrics;
}
