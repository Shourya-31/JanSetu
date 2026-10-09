import type { CompiledReport } from "./adminReportModel";
import { buildPrimaryTable, type ReportTable } from "./adminReportTables";

const localDate = (date: string) =>
  new Date(date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
function htmlTable(headers: string[], rows: unknown[][]) {
  return `<table><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((value) => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
export function summaryRows(report: CompiledReport): (string | number)[][] {
  return [
    ["Data source", "Supplied survey records"],
    ["Block", report.blockName],
    ["Block ID", report.scope.blockId],
    ["Report scope", report.scopeLabel],
    ["Village ID", report.scope.villageId ?? "Entire block"],
    ["Generated (Asia/Kolkata)", localDate(report.generatedAt)],
    ["Villages included", report.summary.villages],
    ["Village survey records", report.summary.villageRecords],
    ["Household survey records", report.summary.householdRecords],
    [
      "Population (recorded village totals)",
      report.summary.population ?? "No data available",
    ],
    [
      "Households (recorded village totals)",
      report.summary.totalHouseholds ?? "No data available",
    ],
    ["Completed household records", report.summary.completedHouseholds],
  ];
}
function ensureRecords(report: CompiledReport) {
  if (!report.answers.length || report.integrationPending)
    throw new Error("Survey data will be available after backend integration.");
}
function printableTable(table: ReportTable) {
  // Split columns, never records. Repeat village/record identifiers in each part.
  const idKeys =
    table.survey === "Household"
      ? ["villageName", "householdId", "recordId"]
      : ["villageName", "recordId"];
  if (table.repeated) idKeys.push(table.nested ? "sourcePath" : "item");
  const idColumns = table.columns
    .map((c, index) => ({ c, index }))
    .filter(({ c }) => idKeys.includes(c.key));
  const fields = table.columns
    .map((c, index) => ({ c, index }))
    .filter(({ c }) => !!c.fieldKey);
  const parts = [];
  for (let offset = 0; offset < Math.max(fields.length, 1); offset += 4) {
    const columns = [...idColumns, ...fields.slice(offset, offset + 4)];
    parts.push(
      `<section><h3>${escapeHtml(table.title)}${fields.length > 4 ? ` — fields ${offset + 1}–${Math.min(offset + 4, fields.length)}` : ""}</h3>${htmlTable(
        columns.map(({ c }) => c.label),
        table.rows.map((row) => columns.map(({ index }) => row.values[index])),
      )}</section>`,
    );
  }
  return parts.join("");
}
export function buildReportHtml(report: CompiledReport): string {
  ensureRecords(report);
  const tables = (kind: "Village" | "Household") =>
    report.tables
      .filter((t) => t.survey === kind && t.rows.length)
      .map(printableTable)
      .join("") || "<p>No data available</p>";
  const registry = (kind: "Village" | "Household") => {
    const records =
      kind === "Village" ? report.villageSurveys : report.householdSurveys;
    return htmlTable(
      [
        "Village",
        "Village ID",
        "Panchayat ID",
        "Record ID",
        "Household ID",
        "Submitted at",
      ],
      records.map((r) => [
        r.villageName,
        r.villageId,
        r.panchayatId,
        r.id,
        r.householdId ?? "",
        r.submittedAt ?? "Not provided",
      ]),
    );
  };
  return `<!doctype html><html lang="hi"><head><meta charset="utf-8"><title>JanSetu — ${escapeHtml(report.blockName)} — ${escapeHtml(report.scopeLabel)}</title><style>@page{size:A4 landscape;margin:12mm}body{font-family:"Nirmala UI","Mangal",sans-serif;color:#0f172a;font-size:9pt;line-height:1.45}h1{font-size:20pt}h2{font-size:15pt;break-before:page}h3{font-size:11pt;break-after:avoid}table{border-collapse:collapse;width:100%;table-layout:fixed;margin-bottom:16px}th,td{border:1px solid #cbd5e1;padding:6px;text-align:left;overflow-wrap:anywhere;white-space:pre-wrap}thead{display:table-header-group}th{background:#f1f5f9}tr{break-inside:avoid}section{margin-top:18px}button{padding:10px 16px}@media print{.actions{display:none}}</style></head><body><div class="actions"><p>Choose “Save as PDF” in the print dialog. All records in the selected scope are included.</p><button onclick="window.print()">Save as PDF / Print</button></div><h1>JanSetu — Compiled Survey Report</h1><p>${escapeHtml(report.blockName)} · ${escapeHtml(report.scopeLabel)} · ${escapeHtml(localDate(report.generatedAt))}</p>${htmlTable(["Report Summary", "Recorded value"], summaryRows(report))}<h2>Village Survey</h2>${registry("Village")}${tables("Village")}<h2>Household Survey — consolidated records</h2>${registry("Household")}${tables("Household")}</body></html>`;
}
export function exportReportPdf(report: CompiledReport) {
  const html = buildReportHtml(report),
    popup = window.open("", "_blank");
  if (!popup) throw new Error("Allow pop-ups to open the complete PDF report.");
  popup.opener = null;
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  void popup.document.fonts.ready.then(() => {
    popup.focus();
    popup.print();
  });
}
export async function createReportWorkbook(report: CompiledReport) {
  ensureRecords(report);
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "JanSetu";
  workbook.created = new Date(report.generatedAt);
  const addSheet = (name: string, headers: string[], rows: unknown[][]) => {
    const limit = 1_048_575;
    for (let offset = 0; offset < Math.max(rows.length, 1); offset += limit) {
      const sheet = workbook.addWorksheet(
        offset ? `${name.slice(0, 25)} ${offset / limit + 1}` : name,
      );
      sheet.addRow(headers);
      for (const row of rows.slice(offset, offset + limit)) sheet.addRow(row);
      sheet.views = [
        { state: "frozen", ySplit: 1, xSplit: Math.min(4, headers.length) },
      ];
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: Math.max(sheet.rowCount, 1), column: headers.length },
      };
      sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" },
      };
      sheet.columns.forEach((c) => {
        c.width = 26;
      });
      sheet.eachRow((row) => {
        row.alignment = { vertical: "top", wrapText: true };
      });
    }
  };
  const addTable = (name: string, table: ReportTable) =>
    addSheet(
      name,
      table.columns.map((c) =>
        c.fieldKey ? `${c.label} [${c.fieldKey}]` : c.label,
      ),
      table.rows.map((r) => r.values),
    );
  addSheet("Report Summary", ["Metric", "Recorded value"], summaryRows(report));
  addTable(
    "Village Survey",
    buildPrimaryTable("Village", report.villageSurveys),
  );
  addTable(
    "Household Survey",
    buildPrimaryTable("Household", report.householdSurveys),
  );
  let villageSection = 0,
    linkedSection = 0;
  for (const table of report.tables) {
    if (
      table.survey === "Village" &&
      table.title !== "ग्राम की सामान्य जानकारी" &&
      table.title !== "Additional saved fields"
    ) {
      const name = `V ${++villageSection} ${table.title}`
        .replace(/[\\/*?:[\]]/g, " ")
        .slice(0, 31);
      addTable(name, table);
    }
    if (table.nested) addTable(`H Linked ${++linkedSection}`, table);
  }
  return workbook;
}
export async function exportReportExcel(report: CompiledReport) {
  const workbook = await createReportWorkbook(report),
    buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([new Uint8Array(buffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = `JanSetu-${report.scope.blockId.replace(/[^a-z0-9-]/gi, "_")}${report.scope.villageId ? `-village-${report.scope.villageId.replace(/[^a-z0-9-]/gi, "_")}` : "-entire-block"}-${report.generatedAt.slice(0, 10)}.xlsx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
