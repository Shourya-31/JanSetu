// ============================================================================
// Analytics Calculation Utilities
// ----------------------------------------------------------------------------
// Reusable functions for computing percentages, counts, and statistics
// from survey response data. These utilities are data-source agnostic and
// accept properly typed data structures.
// ============================================================================

import type {
  QuestionStat,
  OptionCount,
  NumericStat,
  VillageSurveyRecord,
  HouseholdSurveyRecord,
  QuestionDefinition,
  VILLAGE_GENERAL_QUESTIONS,
} from '../types/adminAnalytics';

/**
 * Calculate percentage from count and total.
 * Returns 0 when total is 0 to avoid division by zero.
 */
export function calcPercentage(count: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((count / total) * 10000) / 100; // Two decimal places
}

/**
 * Compute option distribution for a categorical question across records.
 * Excludes unanswered (null/undefined/empty) responses from the denominator.
 */
export function computeCategoricalStat(
  records: Record<string, unknown>[],
  key: string,
  label: string,
  predefinedOptions?: string[]
): QuestionStat {
  const optionCounts = new Map<string, number>();
  let totalValid = 0;

  for (const record of records) {
    const value = record[key];
    if (value === null || value === undefined || value === '') continue;

    const strValue = String(value).trim();
    if (!strValue) continue;

    totalValid++;
    optionCounts.set(strValue, (optionCounts.get(strValue) ?? 0) + 1);
  }

  // If predefined options are specified, ensure they're all listed
  const allOptions = predefinedOptions
    ? predefinedOptions
    : Array.from(optionCounts.keys()).sort();

  const options: OptionCount[] = allOptions.map((option) => ({
    option,
    count: optionCounts.get(option) ?? 0,
    percentage: calcPercentage(optionCounts.get(option) ?? 0, totalValid),
  }));

  // Add any unexpected options not in predefined list
  if (predefinedOptions) {
    for (const [option, count] of optionCounts) {
      if (!predefinedOptions.includes(option)) {
        options.push({
          option,
          count,
          percentage: calcPercentage(count, totalValid),
        });
      }
    }
  }

  return {
    questionKey: key,
    questionLabel: label,
    totalResponses: totalValid,
    options,
  };
}

/**
 * Compute statistics for a numeric field across records.
 */
export function computeNumericStat(
  records: Record<string, unknown>[],
  key: string,
  label: string
): NumericStat {
  let total = 0;
  let count = 0;
  let min = Infinity;
  let max = -Infinity;

  for (const record of records) {
    const raw = record[key];
    if (raw === null || raw === undefined || raw === '') continue;
    const num = Number(raw);
    if (isNaN(num)) continue;

    total += num;
    count++;
    if (num < min) min = num;
    if (num > max) max = num;
  }

  return {
    questionKey: key,
    questionLabel: label,
    total,
    count,
    min: count > 0 ? min : 0,
    max: count > 0 ? max : 0,
    average: count > 0 ? Math.round((total / count) * 100) / 100 : 0,
  };
}

/**
 * Compute multi-select option distribution.
 * For questions where the response is an array of selected options.
 */
export function computeMultiSelectStat(
  records: Record<string, unknown>[],
  key: string,
  label: string,
  predefinedOptions?: string[]
): QuestionStat {
  const optionCounts = new Map<string, number>();
  let totalValid = 0;

  for (const record of records) {
    const value = record[key];
    if (!value) continue;

    const values = Array.isArray(value)
      ? value
      : typeof value === 'string'
      ? value.split(',').map((v) => v.trim())
      : [];

    if (values.length === 0) continue;
    totalValid++;

    for (const v of values) {
      const trimmed = String(v).trim();
      if (trimmed) {
        optionCounts.set(trimmed, (optionCounts.get(trimmed) ?? 0) + 1);
      }
    }
  }

  const allOptions = predefinedOptions
    ? predefinedOptions
    : Array.from(optionCounts.keys()).sort();

  const options: OptionCount[] = allOptions.map((option) => ({
    option,
    count: optionCounts.get(option) ?? 0,
    percentage: calcPercentage(optionCounts.get(option) ?? 0, totalValid),
  }));

  return {
    questionKey: key,
    questionLabel: label,
    totalResponses: totalValid,
    options,
  };
}

/**
 * Generate analytics stats from a set of question definitions and records.
 */
export function computeQuestionStats(
  records: Record<string, unknown>[],
  questions: QuestionDefinition[]
): { categoricalStats: QuestionStat[]; numericStats: NumericStat[] } {
  const categoricalStats: QuestionStat[] = [];
  const numericStats: NumericStat[] = [];

  for (const q of questions) {
    switch (q.type) {
      case 'categorical':
        categoricalStats.push(
          computeCategoricalStat(records, q.key, q.label, q.options)
        );
        break;
      case 'numeric':
        numericStats.push(computeNumericStat(records, q.key, q.label));
        break;
      case 'multi-select':
        categoricalStats.push(
          computeMultiSelectStat(records, q.key, q.label, q.options)
        );
        break;
      // 'text' fields are not statistically summarized
    }
  }

  return { categoricalStats, numericStats };
}

/**
 * Extract general section data from village survey records for analytics.
 */
export function extractVillageGeneralData(
  villageSurveys: VillageSurveyRecord[]
): Record<string, unknown>[] {
  return villageSurveys
    .filter((v) => v.general)
    .map((v) => ({ ...v.general }));
}

/**
 * Aggregate block-level summary from village and household surveys.
 */
export function computeBlockSummary(
  villageSurveys: VillageSurveyRecord[],
  householdSurveys: HouseholdSurveyRecord[]
) {
  let totalPopulation = 0;
  let totalHouseholds = 0;

  for (const v of villageSurveys) {
    if (v.general) {
      const pop = Number(v.general.totalPopulation) || 0;
      const hh = Number(v.general.totalHouseholds) || 0;
      totalPopulation += pop;
      totalHouseholds += hh;
    }
  }

  return {
    totalVillagesSurveyed: villageSurveys.length,
    totalHouseholdsSurveyed: householdSurveys.length,
    totalPopulation,
    totalHouseholds,
    uniqueVillages: new Set(villageSurveys.map((v) => v.villageName)).size,
    uniquePanchayats: new Set(villageSurveys.map((v) => v.panchayat)).size,
  };
}
