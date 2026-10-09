import { useMemo, useState } from "react";
import type { CompiledReport } from "../../utils/adminReportModel";
import type { ReportTable } from "../../utils/adminReportTables";

export function ConsolidatedTables({
  report,
  kind,
  title,
}: {
  report: CompiledReport;
  kind: "Village" | "Household";
  title?: string;
}) {
  const [search, setSearch] = useState(""),
    [page, setPage] = useState(0);
  const tables = report.tables.filter((t) => t.survey === kind);
  const ids = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return [
      ...new Set(
        report.tables
          .filter((t) => t.survey === kind)
          .flatMap((t) =>
            t.rows
              .filter(
                (r) =>
                  !query ||
                  r.values.some((v) => v.toLocaleLowerCase().includes(query)),
              )
              .map((r) => r.recordId),
          ),
      ),
    ];
  }, [report.tables, kind, search]);
  const pages = Math.ceil(ids.length / 10),
    current = Math.min(page, Math.max(pages - 1, 0));
  const visible = new Set(ids.slice(current * 10, current * 10 + 10));
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 min-w-0">
      <h3 className="text-lg font-bold">
        {title ?? `${kind} Survey — consolidated recorded data`}
      </h3>
      <label className="block text-xs font-semibold">
        <span>Search {kind.toLowerCase()} records across all fields</span>
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Village, identifier, or recorded answer"
          className="block mt-2 w-full max-w-lg rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
        />
      </label>
      <p className="text-xs text-slate-500">
        {ids.length} matching records · One row per{" "}
        {kind === "Household" ? "household" : "village"} in each section.
        Repeated facility data and structured saved data use linked rows. Search
        and pagination affect viewing; exports include every record in the
        selected report scope.
      </p>
      {!ids.length ? (
        <p className="text-sm text-slate-500">No matching records.</p>
      ) : (
        tables.map((table, index) => (
          <details
            key={table.id}
            open={index === 0}
            className="rounded-xl border border-slate-200 p-3 min-w-0"
          >
            <summary className="text-sm font-semibold cursor-pointer">
              {table.title}
            </summary>
            <SurveyTable table={table} visible={visible} />
          </details>
        ))
      )}
      {pages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <button
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
            className="border rounded-lg px-3 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {current + 1} of {pages}
          </span>
          <button
            disabled={current + 1 >= pages}
            onClick={() => setPage(current + 1)}
            className="border rounded-lg px-3 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
function SurveyTable({
  table,
  visible,
}: {
  table: ReportTable;
  visible: Set<string>;
}) {
  // Stable IDs remain available in every section without unnecessarily widening
  // the screen for block metadata already present in the report heading.
  const columns = table.columns
    .map((column, index) => ({ column, index }))
    .filter(
      ({ column }) =>
        !["blockId", "panchayatId", "submittedAt"].includes(column.key) &&
        !(table.survey === "Village" && column.key === "householdId"),
    );
  const rows = table.rows.filter((row) => visible.has(row.recordId));
  return (
    <div
      className="mt-3 max-w-full overflow-x-auto rounded-lg border border-slate-200"
      role="region"
      aria-label={`${table.title} table`}
      tabIndex={0}
    >
      <table className="min-w-full text-xs">
        <thead className="bg-slate-50">
          <tr>
            {columns.map(({ column }) => (
              <th
                scope="col"
                key={column.key}
                className="min-w-40 max-w-64 px-3 py-3 text-left align-top border-b font-semibold"
                title={column.fieldKey}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.recordId}-${index}`}
              className="border-b last:border-0"
            >
              {columns.map(({ column, index: i }) => (
                <td
                  key={column.key}
                  className="min-w-40 max-w-64 px-3 py-2 align-top whitespace-pre-wrap break-words"
                >
                  {row.values[i] || "Not provided"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <p className="p-3 text-sm text-slate-500">
          No data for the displayed records.
        </p>
      )}
    </div>
  );
}
