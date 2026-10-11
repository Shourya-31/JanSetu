import {
  householdSections,
  villageSections,
  type ReportField,
  type ReportSection,
} from "../data/adminSurveyCatalog";
import type { ReportScope, SurveyDataset } from "../types/adminReports";
import { displayAnswer, numericValue, percentage } from "./adminSurveyValues";
import {
  childBirthCertificateMetric,
  eligibleHouseholdResponses,
  INELIGIBLE_OPTIONS,
  villageFamilyMetrics,
} from "./adminAnalyticsMetrics";
import { buildReportTables } from "./adminReportTables";
export { displayAnswer, numericValue, percentage } from "./adminSurveyValues";

export interface Distribution {
  survey: "Village" | "Household";
  section: string;
  key: string;
  label: string;
  denominator: number;
  multiple: boolean;
  ineligible: number;
  unknownEligibility: number;
  options: { option: string; count: number; percentage: number }[];
}
export interface AnswerRow {
  survey: string;
  recordId: string;
  villageId: string;
  villageName: string;
  householdId: string;
  submittedAt: string;
  section: string;
  item: number;
  key: string;
  label: string;
  value: string;
}
function asObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
export function sectionAnswers(
  answers: unknown,
  section: ReportSection,
  village: boolean,
): Record<string, unknown>[] {
  const data = asObject(answers);
  if (!village || section.id === "general") return [data];
  const value = data[section.id];
  return section.repeated
    ? Array.isArray(value)
      ? value.map(asObject)
      : []
    : [asObject(value)];
}
export function distribution(
  responses: Record<string, unknown>[],
  field: ReportField,
) {
  const counts = new Map<string, number>(field.options.map((o) => [o, 0]));
  let denominator = 0;
  for (const response of responses) {
    const raw = response[field.key];
    const values =
      field.type === "multi-select"
        ? Array.isArray(raw)
          ? raw
          : []
        : typeof raw === "string" ||
            typeof raw === "boolean" ||
            typeof raw === "number"
          ? [raw]
          : [];
    const valid = [
      ...new Set(
        values
          .filter((v) => ["string", "number", "boolean"].includes(typeof v))
          .map((v) => String(v).trim())
          .filter(Boolean),
      ),
    ];
    if (!valid.length) continue;
    denominator++;
    valid.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  }
  return {
    denominator,
    options: [...counts].map(([option, count]) => ({
      option,
      count,
      percentage: percentage(count, denominator),
    })),
  };
}
export function compileReport(
  dataset: SurveyDataset,
  scope: ReportScope,
  blockName: string,
  generatedAt = new Date().toISOString(),
) {
  // Stable database record IDs only: names and house numbers are not unique keys.
  function select<
    T extends {
      id: string;
      blockId: string;
      panchayatId: string;
      villageId: string;
      panchayatKey?: string;
      villageKey?: string;
    },
  >(rows: T[]): T[] {
    const seen = new Map<string, T>();
    for (const row of rows) {
      if (!row.id || !row.villageId)
        throw new Error("Survey record is missing its stable identifier.");
      if (
        row.blockId !== scope.blockId ||
        (scope.panchayatId &&
          row.panchayatId !== scope.panchayatId &&
          row.panchayatKey !== scope.panchayatId) ||
        (scope.villageId &&
          row.villageId !== scope.villageId &&
          row.villageKey !== scope.villageId)
      )
        continue;
      const previous = seen.get(row.id);
      if (previous && JSON.stringify(previous) !== JSON.stringify(row))
        throw new Error(`Conflicting duplicate record: ${row.id}`);
      seen.set(row.id, row);
    }
    return [...seen.values()];
  }
  const villageSurveys = select(dataset.villageSurveys),
    householdSurveys = select(dataset.householdSurveys);
  const villageIds = new Set<string>(),
    householdIds = new Set<string>();
  for (const record of villageSurveys) {
    if (villageIds.has(record.villageId))
      throw new Error(
        "Multiple village survey versions supplied. The integration adapter must select the eligible version per village.",
      );
    villageIds.add(record.villageId);
  }
  for (const record of householdSurveys)
    if (record.householdId) {
      if (householdIds.has(record.householdId))
        throw new Error(
          "Multiple household survey versions supplied. The integration adapter must select the eligible version per household.",
        );
      householdIds.add(record.householdId);
    }
  const statistics: Distribution[] = [],
    answers: AnswerRow[] = [];
  const numericStats: {
    survey: string;
    section: string;
    key: string;
    label: string;
    count: number;
    total: number;
  }[] = [];
  for (const [survey, records, sections] of [
    ["Village", villageSurveys, villageSections],
    ["Household", householdSurveys, householdSections],
  ] as const) {
    const known = new Set(sections.flatMap((s) => s.fields.map((f) => f.key)));
    for (const section of sections) {
      const responses = records.flatMap((r) =>
        sectionAnswers(r.answers, section, survey === "Village"),
      );
      for (const field of section.fields) {
        if (
          survey === "Household" &&
          (field.type === "categorical" || field.type === "multi-select")
        ) {
          const eligible = eligibleHouseholdResponses(responses, field.key);
          const stats = distribution(eligible.responses, {
            ...field,
            options: field.options.filter((o) => !INELIGIBLE_OPTIONS.has(o)),
          });
          statistics.push({
            survey,
            section: section.title,
            key: field.key,
            label: field.label,
            multiple: field.type === "multi-select",
            ineligible: eligible.ineligible,
            unknownEligibility: eligible.unknownEligibility,
            ...stats,
          });
        }
        if (field.type === "numeric") {
          const values = responses
            .map((r) => numericValue(r[field.key]))
            .filter((n): n is number => n !== null);
          numericStats.push({
            survey,
            section: section.title,
            key: field.key,
            label: field.label,
            count: values.length,
            total: values.reduce((a, b) => a + b, 0),
          });
        }
      }
      for (const record of records) {
        const entries = sectionAnswers(
          record.answers,
          section,
          survey === "Village",
        );
        (entries.length ? entries : [{}]).forEach((entry, index) => {
          const fields = [...section.fields];
          if (survey === "Village" && section.id !== "general")
            for (const key of Object.keys(entry))
              if (!fields.some((f) => f.key === key))
                fields.push({ key, label: key, type: "text", options: [] });
          for (const field of fields)
            answers.push({
              survey,
              recordId: record.id,
              villageId: record.villageId,
              villageName: record.villageName,
              householdId: record.householdId ?? "",
              submittedAt: record.submittedAt ?? "",
              section: section.title,
              item: index + 1,
              key: field.key,
              label: field.label,
              value: displayAnswer(entry[field.key]),
            });
        });
      }
    }
    // Preserve metadata and future/unknown saved fields, without inventing statistics.
    for (const record of records)
      for (const [key, value] of Object.entries(record.answers)) {
        if (known.has(key) || sections.some((s) => s.id === key)) continue;
        answers.push({
          survey,
          recordId: record.id,
          villageId: record.villageId,
          villageName: record.villageName,
          householdId: record.householdId ?? "",
          submittedAt: record.submittedAt ?? "",
          section: "Additional saved fields",
          item: 1,
          key,
          label: key,
          value: displayAnswer(value),
        });
      }
  }
  const sumField = (key: "totalPopulation" | "totalHouseholds") => {
    const values = villageSurveys
      .map((r) => numericValue(r.answers[key]))
      .filter((n): n is number => n !== null);
    return values.length ? values.reduce((a, b) => a + b, 0) : null;
  };
  const totalHouseholds = sumField("totalHouseholds");
  const completed = householdSurveys.filter(
    (r) => r.completed === true || r.answers.isCompleted === true,
  ).length;
  const householdsWithStatus = householdSurveys.filter(
    (r) =>
      typeof r.completed === "boolean" ||
      typeof r.answers.isCompleted === "boolean",
  ).length;
  const summary = {
    villages: new Set(
      [...villageSurveys, ...householdSurveys].map((r) => r.villageId),
    ).size,
    villageRecords: villageSurveys.length,
    householdRecords: householdSurveys.length,
    population: sumField("totalPopulation"),
    totalHouseholds,
    completedHouseholds: completed,
    completion: householdsWithStatus
      ? percentage(completed, householdsWithStatus)
      : null,
    completionDenominator: householdsWithStatus,
  };
  return {
    blockName,
    scope,
    scopeLabel: scope.villageId
      ? `Single village: ${villageSurveys[0]?.villageName ?? householdSurveys[0]?.villageName ?? scope.villageId}`
      : "Entire block",
    generatedAt,
    integrationPending: dataset.integrationPending,
    villageSurveys,
    householdSurveys,
    summary,
    statistics,
    numericStats,
    answers,
    villageFamilyMetrics: villageFamilyMetrics(villageSurveys),
    childBirthCertificateMetric: childBirthCertificateMetric(householdSurveys),
    tables: buildReportTables(villageSurveys, householdSurveys, answers),
  };
}
export type CompiledReport = ReturnType<typeof compileReport>;
