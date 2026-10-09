import { householdSections, villageSections } from "../data/adminSurveyCatalog";
import type { AnswerRow } from "./adminReportModel";
import type {
  HouseholdAnswers,
  SurveyRecord,
  VillageAnswers,
} from "../types/adminReports";
import { displayAnswer } from "./adminSurveyValues";

export interface ReportColumn {
  key: string;
  label: string;
  fieldKey?: string;
}
export interface ReportTable {
  id: string;
  survey: "Village" | "Household";
  title: string;
  repeated: boolean;
  nested: boolean;
  columns: ReportColumn[];
  rows: { recordId: string; values: string[] }[];
}
const identity: ReportColumn[] = [
  { key: "villageName", label: "Village" },
  { key: "villageId", label: "Village ID" },
  { key: "householdId", label: "Household ID" },
  { key: "recordId", label: "Survey Record ID" },
  { key: "blockId", label: "Block ID" },
  { key: "panchayatId", label: "Panchayat ID" },
  { key: "submittedAt", label: "Submitted at" },
];
type RecordData = SurveyRecord<VillageAnswers> | SurveyRecord<HouseholdAnswers>;
function ids(record: RecordData): string[] {
  return [
    record.villageName,
    record.villageId,
    record.householdId ?? "",
    record.id,
    record.blockId,
    record.panchayatId,
    record.submittedAt ?? "Not provided",
  ];
}
const structured = (value: unknown): boolean =>
  value !== null &&
  typeof value === "object" &&
  (!Array.isArray(value) ||
    value.some((item) => item !== null && typeof item === "object"));

export function buildReportTables(
  villageSurveys: SurveyRecord<VillageAnswers>[],
  householdSurveys: SurveyRecord<HouseholdAnswers>[],
  answers: AnswerRow[],
): ReportTable[] {
  const tables: ReportTable[] = [];
  for (const [survey, records, definitions] of [
    ["Village", villageSurveys, villageSections],
    ["Household", householdSurveys, householdSections],
  ] as const) {
    const byRecord = new Map(records.map((r) => [r.id, r]));
    const selected = answers.filter((a) => a.survey === survey);
    for (const section of [
      ...definitions.map((s) => ({
        title: s.title,
        repeated: s.repeated,
        fields: s.fields,
      })),
      { title: "Additional saved fields", repeated: false, fields: [] },
    ]) {
      const rows = selected.filter((a) => a.section === section.title);
      if (!rows.length && section.title === "Additional saved fields") continue;
      const fields = new Map(
        section.fields.map((f) => [
          f.key,
          { key: `answer:${f.key}`, fieldKey: f.key, label: f.label },
        ]),
      );
      for (const row of rows)
        if (!fields.has(row.key))
          fields.set(row.key, {
            key: `answer:${row.key}`,
            fieldKey: row.key,
            label: row.label,
          });
      const groups = new Map<string, Map<string, AnswerRow>>();
      for (const row of rows) {
        const groupKey = JSON.stringify([row.recordId, row.item]);
        const group = groups.get(groupKey) ?? new Map<string, AnswerRow>();
        group.set(row.key, row);
        groups.set(groupKey, group);
      }
      const columns = [
        ...identity,
        ...(section.repeated
          ? [{ key: "item", label: "Facility / Item" }]
          : []),
        ...fields.values(),
      ];
      tables.push({
        id: `${survey}-${section.title}`,
        survey,
        title: section.title,
        repeated: section.repeated,
        nested: false,
        columns,
        rows: [...groups.values()].map((group) => {
          const first = [...group.values()][0],
            record = byRecord.get(first.recordId)!;
          const values = [
            ...ids(record),
            ...(section.repeated ? [String(first.item)] : []),
            ...[...fields.keys()].map((key) => {
              const raw = (record.answers as Record<string, unknown>)[key];
              return survey === "Household" && structured(raw)
                ? `See linked table: ${key}`
                : (group.get(key)?.value ?? "Not answered");
            }),
          ];
          return { recordId: record.id, values };
        }),
      });
    }
    // Existing forms contain no member roster. Preserve any subsequently supplied
    // structured saved data in linked tables, using its original keys and positions.
    const nestedTables = new Map<
      string,
      {
        columns: Set<string>;
        rows: {
          record: RecordData;
          path: string;
          data: Record<string, unknown>;
        }[];
      }
    >();
    const collect = (
      record: RecordData,
      value: unknown,
      path: string,
      position: string,
    ) => {
      if (!structured(value)) return;
      const items = Array.isArray(value) ? value : [value];
      items.forEach((item, index) => {
        const rowPath = `${position}${Array.isArray(value) ? `[${index}]` : ""}`;
        const data =
          item !== null && typeof item === "object" && !Array.isArray(item)
            ? (item as Record<string, unknown>)
            : { value: item };
        const table = nestedTables.get(path) ?? {
          columns: new Set<string>(),
          rows: [],
        };
        for (const key of Object.keys(data)) table.columns.add(key);
        table.rows.push({ record, path: rowPath, data });
        nestedTables.set(path, table);
        for (const [key, child] of Object.entries(data))
          if (structured(child))
            collect(record, child, `${path}.${key}`, `${rowPath}.${key}`);
      });
    };
    if (survey === "Household")
      for (const record of records)
        for (const [key, value] of Object.entries(record.answers))
          collect(record, value, key, key);
    for (const [path, data] of nestedTables) {
      const keys = [...data.columns];
      tables.push({
        id: `${survey}-nested-${path}`,
        survey,
        title: `Linked saved data: ${path}`,
        repeated: true,
        nested: true,
        columns: [
          ...identity,
          { key: "sourcePath", label: "Saved source path" },
          ...keys.map((key) => ({
            key: `nested:${key}`,
            fieldKey: key,
            label: key,
          })),
        ],
        rows: data.rows.map((row) => ({
          recordId: row.record.id,
          values: [
            ...ids(row.record),
            row.path,
            ...keys.map((key) =>
              structured(row.data[key])
                ? `See linked table: ${path}.${key}`
                : displayAnswer(row.data[key]),
            ),
          ],
        })),
      });
    }
  }
  return tables;
}
/** Primary worksheets: one row per eligible record, with ALL existing fields. */
export function buildPrimaryTable(
  survey: "Village" | "Household",
  records: RecordData[],
): ReportTable {
  const definitions =
    survey === "Village" ? [villageSections[0]] : householdSections;
  const fields = new Map(
    definitions.flatMap((s) =>
      s.fields.map(
        (f) =>
          [
            f.key,
            { key: `answer:${f.key}`, fieldKey: f.key, label: f.label },
          ] as const,
      ),
    ),
  );
  const sectionKeys = new Set(villageSections.slice(1).map((s) => s.id));
  for (const record of records)
    for (const key of Object.keys(record.answers))
      if (!(survey === "Village" && sectionKeys.has(key)) && !fields.has(key))
        fields.set(key, { key: `answer:${key}`, fieldKey: key, label: key });
  const keys = [...fields.keys()];
  return {
    id: `${survey}-primary`,
    survey,
    title: `${survey} Survey`,
    repeated: false,
    nested: false,
    columns: [...identity, ...fields.values()],
    rows: records.map((record) => ({
      recordId: record.id,
      values: [
        ...ids(record),
        ...keys.map((key) => {
          const value = (record.answers as Record<string, unknown>)[key];
          return survey === "Household" && structured(value)
            ? `See linked table: ${key}`
            : displayAnswer(value);
        }),
      ],
    })),
  };
}
