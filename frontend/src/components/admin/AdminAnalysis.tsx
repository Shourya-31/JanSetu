import { useState } from "react";
import type { CompiledReport } from "../../utils/adminReportModel";
import { ConsolidatedTables } from "./AdminConsolidatedTables";

export function AdminAnalysis({ report }: { report: CompiledReport }) {
  const [page, setPage] = useState(0);
  const metrics = report.villageFamilyMetrics,
    pages = Math.ceil(metrics.length / 12),
    current = Math.min(page, Math.max(0, pages - 1));
  const child = report.childBirthCertificateMetric;
  const availableChildCount = report.numericStats.find(
    (s) =>
      s.survey === "Household" && s.key === "childrenWithoutBirthCertificate",
  );
  return (
    <section className="space-y-5">
      <ConsolidatedTables
        report={report}
        kind="Village"
        title="Village Survey — recorded answers"
      />
      <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-lg">Village family-count analysis</h3>
        <p className="text-xs text-slate-500">
          Only housing and water-exclusion counts use कुल घर / परिवार संख्या.
          Each village uses its own recorded total; population and facility
          counts remain recorded values.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                {[
                  "Village",
                  "Question",
                  "Recorded count",
                  "Family denominator",
                  "Percentage / data quality",
                ].map((h) => (
                  <th key={h} className="p-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.slice(current * 12, current * 12 + 12).map((m) => (
                <tr key={`${m.recordId}-${m.key}`} className="border-b">
                  <td className="p-3">{m.villageName}</td>
                  <td className="p-3">{m.label}</td>
                  <td className="p-3">{m.numerator ?? "Not answered"}</td>
                  <td className="p-3">{m.denominator ?? "Not available"}</td>
                  <td className="p-3">
                    {m.percentage === null ? (
                      <span className="text-amber-800">{m.issue}</span>
                    ) : (
                      `${m.numerator} out of ${m.denominator} families — ${m.percentage}%`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!metrics.length && (
          <p className="text-sm text-slate-500">No village data available.</p>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <button
              disabled={!current}
              onClick={() => setPage(current - 1)}
              className="border rounded px-3 py-2 disabled:opacity-40"
            >
              Previous metrics
            </button>
            <span>
              Page {current + 1} of {pages}
            </span>
            <button
              disabled={current + 1 >= pages}
              onClick={() => setPage(current + 1)}
              className="border rounded px-3 py-2 disabled:opacity-40"
            >
              Next metrics
            </button>
          </div>
        )}
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-lg">
          Household Survey — eligible household responses
        </h3>
        <p className="text-xs text-slate-500">
          These distributions count households, including when a question asks
          about their members. “पात्रता नहीं” and “लागू नहीं” are excluded.
          Known follow-up conditions are applied; unanswered responses are
          excluded. Multiple selections can total above 100%.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {report.statistics.map((s) => (
            <div
              key={`${s.section}-${s.key}`}
              className="rounded-xl border p-4"
            >
              <p className="text-xs text-blue-700 mb-1">{s.section}</p>
              <h4 className="text-sm font-semibold">{s.label}</h4>
              <p className="text-xs text-slate-500 mt-1">
                Eligible answered households: {s.denominator}
                {s.multiple ? " · Multiple selection" : ""}
              </p>
              {(s.ineligible > 0 || s.unknownEligibility > 0) && (
                <p className="text-xs text-slate-500 mt-1">
                  Excluded: {s.ineligible} ineligible; {s.unknownEligibility}{" "}
                  with unknown eligibility.
                </p>
              )}
              {!s.denominator ? (
                <p className="text-sm text-slate-500 mt-3">
                  No eligible responses available
                </p>
              ) : (
                s.options.map((o) => (
                  <div key={o.option} className="mt-3">
                    <div className="flex justify-between gap-3 text-xs mb-1">
                      <span>{o.option}</span>
                      <span>
                        {o.count} out of {s.denominator} eligible households —{" "}
                        {o.percentage}%
                      </span>
                    </div>
                    <progress
                      aria-label={`${s.label}: ${o.option}`}
                      value={o.percentage}
                      max={100}
                      className="w-full h-2 accent-blue-600"
                    />
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-lg">Person-count analysis</h3>
        <h4 className="text-sm font-semibold">{child.label}</h4>
        <p className="font-semibold">
          {child.percentage === null
            ? "Eligible denominator unavailable"
            : `${child.numerator} out of ${child.denominator} eligible children — ${child.percentage}%`}
        </p>
        <p className="text-xs text-slate-500">
          Uses childrenWithoutBirthCertificate / children from the same
          households. Based on {child.includedRecords} compatible household
          records; {child.excludedRecords} excluded. Available recorded count
          across all valid answers:{" "}
          {availableChildCount?.count
            ? availableChildCount.total
            : "No data available"}
          .
        </p>
        {child.issue && <p className="text-sm text-amber-800">{child.issue}</p>}
        <p className="text-xs text-slate-500">
          The existing form has no age-specific member roster or
          school-age/working-age/literacy denominators. Those person-specific
          percentages cannot be determined; available counts remain below.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="p-2">Recorded numeric question</th>
                <th className="p-2">Answered households</th>
                <th className="p-2">Recorded total</th>
              </tr>
            </thead>
            <tbody>
              {report.numericStats
                .filter((s) => s.survey === "Household")
                .map((s) => (
                  <tr key={`${s.section}-${s.key}`} className="border-b">
                    <td className="p-2">{s.label}</td>
                    <td className="p-2">{s.count}</td>
                    <td className="p-2">
                      {s.count ? s.total : "No data available"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
