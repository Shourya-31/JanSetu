import { householdSections, villageSections } from "../data/adminSurveyCatalog";
import type {
  HouseholdAnswers,
  SurveyRecord,
  VillageAnswers,
} from "../types/adminReports";
import { numericValue, percentage } from "./adminSurveyValues";

// Reviewed against GeneralInformation.tsx. Only subsets of total houses/families.
export const FAMILY_COUNT_FIELDS = [
  "puccaHouses",
  "rawHouses",
  "completedHouses",
  "pendingHouses",
  "housingNotSanctioned",
  "tapWaterExcludedFamilies",
] as const;
export interface CountRatio {
  key: string;
  label: string;
  villageName?: string;
  recordId?: string;
  numerator: number | null;
  denominator: number | null;
  percentage: number | null;
  unit: "families" | "children";
  issue: string | null;
  includedRecords: number;
  excludedRecords: number;
}
export function countRatio(numerator: unknown, denominator: unknown) {
  const count = numericValue(numerator),
    total = numericValue(denominator);
  if (count === null || !Number.isInteger(count))
    return {
      numerator: count,
      denominator: total,
      percentage: null,
      issue: "Missing or invalid whole-person/family count",
    };
  if (total === null || total <= 0 || !Number.isInteger(total))
    return {
      numerator: count,
      denominator: total,
      percentage: null,
      issue: "Eligible denominator is missing, zero, or invalid",
    };
  if (count > total)
    return {
      numerator: count,
      denominator: total,
      percentage: null,
      issue: "Recorded count exceeds the eligible total",
    };
  return {
    numerator: count,
    denominator: total,
    percentage: percentage(count, total),
    issue: null,
  };
}
export function villageFamilyMetrics(
  records: SurveyRecord<VillageAnswers>[],
): CountRatio[] {
  return records.flatMap((record) =>
    FAMILY_COUNT_FIELDS.map((key) => ({
      key,
      label: villageSections[0].fields.find((f) => f.key === key)!.label,
      villageName: record.villageName,
      recordId: record.id,
      unit: "families" as const,
      includedRecords: 1,
      excludedRecords: 0,
      ...countRatio(record.answers[key], record.answers.totalHouseholds),
    })),
  );
}
export function childBirthCertificateMetric(
  records: SurveyRecord<HouseholdAnswers>[],
): CountRatio {
  let numerator = 0,
    denominator = 0,
    includedRecords = 0,
    excludedRecords = 0,
    inconsistent = false;
  for (const record of records) {
    const ratio = countRatio(
      record.answers.childrenWithoutBirthCertificate,
      record.answers.children,
    );
    if (ratio.percentage === null) {
      excludedRecords++;
      if (
        ratio.numerator !== null &&
        ratio.denominator !== null &&
        ratio.numerator > ratio.denominator
      )
        inconsistent = true;
      continue;
    }
    numerator += ratio.numerator!;
    denominator += ratio.denominator!;
    includedRecords++;
  }
  return {
    key: "childrenWithoutBirthCertificate",
    label: householdSections
      .flatMap((s) => s.fields)
      .find((f) => f.key === "childrenWithoutBirthCertificate")!.label,
    unit: "children",
    numerator: includedRecords ? numerator : null,
    denominator: includedRecords ? denominator : null,
    percentage: includedRecords ? percentage(numerator, denominator) : null,
    includedRecords,
    excludedRecords,
    issue: inconsistent
      ? "Some household counts exceed the recorded child total; those records are excluded."
      : excludedRecords
        ? "Households with missing, zero, or invalid child denominators are excluded."
        : null,
  };
}
export const INELIGIBLE_OPTIONS = new Set(["पात्रता नहीं", "लागू नहीं"]);
// Only explicit existing form conditions; unknown eligibility is excluded.
const CONDITIONS: Record<
  string,
  { key: keyof HouseholdAnswers; values: string[] }
> = {
  aadhaarEkyc: { key: "rationCard", values: ["हाँ"] },
  deathCertificateReceived: { key: "deathInLastYear", values: ["हाँ"] },
  assistanceTypes: { key: "needsAssistiveDevice", values: ["हाँ"] },
  schoolNotGoingReason: {
    key: "childrenSchoolStatus",
    values: ["कुछ", "कोई नहीं"],
  },
};
export function eligibleHouseholdResponses(
  records: Record<string, unknown>[],
  key: string,
) {
  let ineligible = 0,
    unknownEligibility = 0;
  const responses = records.filter((record) => {
    const condition = CONDITIONS[key];
    if (condition) {
      const value = record[condition.key];
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      ) {
        unknownEligibility++;
        return false;
      }
      const knownOptions =
        householdSections
          .flatMap((section) => section.fields)
          .find((field) => field.key === condition.key)?.options ?? [];
      if (!knownOptions.includes(String(value).trim())) {
        unknownEligibility++;
        return false;
      }
      if (!condition.values.includes(String(value).trim())) {
        ineligible++;
        return false;
      }
    }
    if (INELIGIBLE_OPTIONS.has(String(record[key] ?? "").trim())) {
      ineligible++;
      return false;
    }
    return true;
  });
  return { responses, ineligible, unknownEligibility };
}
