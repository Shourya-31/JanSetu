import { useEffect, useMemo, useState } from "react";
import { CENSUS_HIERARCHY } from "../../data/narayanpurHierarchy";
import {
  householdSections,
  villageSections,
} from "../../data/adminSurveyCatalog";
import type { AdminReportService } from "../../services/adminReportService";
import type { SurveyDataset } from "../../types/adminReports";
import {
  compileReport,
  type CompiledReport,
} from "../../utils/adminReportModel";
import {
  exportReportExcel,
  exportReportPdf,
} from "../../utils/adminReportExports";
import { AdminAnalysis } from "./AdminAnalysis";
import { ConsolidatedTables } from "./AdminConsolidatedTables";

const control =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-100 disabled:text-slate-400";
const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
export function AdminSurveyWorkspace({
  mode,
  service,
}: {
  mode: "analytics" | "reports";
  service: AdminReportService;
}) {
  const [district, setDistrict] = useState(""),
    [blockId, setBlock] = useState(""),
    [panchayatId, setPanchayat] = useState(""),
    [villageId, setVillage] = useState("");
  const [reportScope, setReportScope] = useState<"block" | "village">("block");
  const scopeReady =
    !!blockId && (mode !== "reports" || reportScope === "block" || !!villageId);
  const activeVillageId =
    mode === "reports" && reportScope === "block" ? "" : villageId;
  const [state, setState] = useState<{
    key: string;
    status: "idle" | "loading" | "success" | "error";
    data: SurveyDataset | null;
    error: string;
  }>({ key: "", status: "idle", data: null, error: "" });
  const [retry, setRetry] = useState(0),
    [exporting, setExporting] = useState(false),
    [exportError, setExportError] = useState("");
  const block = CENSUS_HIERARCHY.find((b) => b.id === blockId),
    panchayat = block?.panchayats.find((p) => p.id === panchayatId);
  const blockName = block
    ? `${block.blockName} / ${block.blockNameEnglish}`
    : "";
  const requestKey = JSON.stringify([
    blockId,
    panchayatId,
    activeVillageId,
    reportScope,
    retry,
  ]);
  useEffect(() => {
    if (!scopeReady) return;
    const controller = new AbortController();
    let active = true;
    Promise.resolve()
      .then(() => {
        if (!active) return null;
        setState({ key: requestKey, status: "loading", data: null, error: "" });
        return service.loadSurveys(
          {
            blockId,
            panchayatId: panchayatId || undefined,
            villageId: activeVillageId || undefined,
          },
          controller.signal,
        );
      })
      .then((data) => {
        if (active && data)
          setState({ key: requestKey, status: "success", data, error: "" });
      })
      .catch((error: unknown) => {
        if (active)
          setState({
            key: requestKey,
            status: "error",
            data: null,
            error:
              error instanceof Error
                ? error.message
                : "Could not load survey data.",
          });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [blockId, panchayatId, activeVillageId, scopeReady, service, requestKey]);
  const result = useMemo(() => {
    if (!scopeReady || !state.data || !blockName || state.key !== requestKey)
      return { report: null, error: "" };
    try {
      return {
        report: compileReport(
          state.data,
          {
            blockId,
            panchayatId: panchayatId || undefined,
            villageId: activeVillageId || undefined,
          },
          blockName,
        ),
        error: "",
      };
    } catch (error) {
      return {
        report: null,
        error:
          error instanceof Error ? error.message : "Could not compile report.",
      };
    }
  }, [
    state.data,
    state.key,
    requestKey,
    blockName,
    blockId,
    panchayatId,
    activeVillageId,
    scopeReady,
  ]);
  const report = result.report;
  const changeBlock = (id: string) => {
    setBlock(id);
    setPanchayat("");
    setVillage("");
    setState({ key: "", status: "idle", data: null, error: "" });
    setExportError("");
  };
  const exportFile = async (kind: "pdf" | "excel") => {
    if (!report) return;
    setExporting(true);
    setExportError("");
    try {
      if (kind === "pdf") exportReportPdf(report);
      else await exportReportExcel(report);
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "Report export failed. Please retry.",
      );
    } finally {
      setExporting(false);
    }
  };
  const canExport =
    !!report &&
    !report.integrationPending &&
    report.answers.length > 0 &&
    !exporting;
  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-blue-700">ADMIN WORKSPACE</span>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          {mode === "analytics" ? "Analytics" : "Reports"}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {mode === "analytics"
            ? "Select a location to explore Village and Household Survey responses."
            : "Select an entire block or a single village to view complete compiled survey tables."}
        </p>
      </div>
      <section className={card} aria-label="Location selection">
        <h3 className="mb-4 font-semibold">
          {mode === "reports" ? "Select block" : "Select location"}
        </h3>
        <div
          className={`grid gap-4 ${mode === "analytics" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}
        >
          {mode === "analytics" && (
            <label className="text-xs font-semibold space-y-2">
              <span>District / जिला</span>
              <select
                className={control}
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  changeBlock("");
                }}
              >
                <option value="">Select district</option>
                <option value="narayanpur">नारायणपुर / Narayanpur</option>
              </select>
            </label>
          )}
          <label className="text-xs font-semibold space-y-2">
            <span>Block / विकासखंड</span>
            <select
              className={control}
              value={blockId}
              disabled={mode === "analytics" && !district}
              onChange={(e) => changeBlock(e.target.value)}
            >
              <option value="">Select block</option>
              {CENSUS_HIERARCHY.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.blockName} / {b.blockNameEnglish}
                </option>
              ))}
            </select>
          </label>
          {mode === "reports" && (
            <>
              <label className="text-xs font-semibold space-y-2">
                <span>Report Scope</span>
                <select
                  className={control}
                  value={reportScope}
                  onChange={(e) => {
                    setReportScope(e.target.value as "block" | "village");
                    setVillage("");
                    setExportError("");
                  }}
                >
                  <option value="block">Entire Block</option>
                  <option value="village">Single Village</option>
                </select>
              </label>
              {reportScope === "village" && (
                <label className="text-xs font-semibold space-y-2">
                  <span>Village / ग्राम</span>
                  <select
                    className={control}
                    value={villageId}
                    disabled={!blockId}
                    onChange={(e) => {
                      setVillage(e.target.value);
                      setExportError("");
                    }}
                  >
                    <option value="">Select village</option>
                    {block?.panchayats.map((p) => (
                      <optgroup
                        key={p.id}
                        label={`${p.name} / ${p.nameEnglish}`}
                      >
                        {p.villages.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.nameHindi} / {v.nameEnglish}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}
          {mode === "analytics" && (
            <>
              <label className="text-xs font-semibold space-y-2">
                <span>Gram Panchayat / ग्राम पंचायत</span>
                <select
                  className={control}
                  value={panchayatId}
                  disabled={!blockId}
                  onChange={(e) => {
                    setPanchayat(e.target.value);
                    setVillage("");
                  }}
                >
                  <option value="">All panchayats</option>
                  {block?.panchayats.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} / {p.nameEnglish}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold space-y-2">
                <span>Village / ग्राम</span>
                <select
                  className={control}
                  value={villageId}
                  disabled={!panchayatId}
                  onChange={(e) => setVillage(e.target.value)}
                >
                  <option value="">All villages</option>
                  {panchayat?.villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nameHindi} / {v.nameEnglish}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>
      </section>
      {mode === "reports" && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={!scopeReady || exporting}
            onClick={() => setRetry((n) => n + 1)}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            View Report
          </button>
          <button
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 cursor-pointer"
            disabled={!canExport}
            onClick={() => void exportFile("pdf")}
          >
            Export as PDF
          </button>
          <button
            className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40 cursor-pointer"
            disabled={!canExport}
            onClick={() => void exportFile("excel")}
          >
            Export as Excel
          </button>
          <span className="text-xs text-slate-500">
            {exporting
              ? "Preparing all report records…"
              : "PDF opens the complete report in the browser print dialog (Save as PDF)."}
          </span>
        </div>
      )}
      {((state.key === requestKey && state.error) ||
        result.error ||
        exportError) && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          {(state.key === requestKey && state.error) ||
            result.error ||
            exportError}
          {state.status === "error" && (
            <button
              className="ml-3 underline"
              onClick={() => setRetry((n) => n + 1)}
            >
              Retry
            </button>
          )}
        </div>
      )}
      {scopeReady &&
        (state.status === "loading" || state.key !== requestKey) && (
          <div role="status" className={card}>
            Loading survey records…
          </div>
        )}
      {!blockId && (
        <div className={`${card} text-center text-slate-500`}>
          Select {mode === "reports" ? "a block" : "a location"} to begin.
        </div>
      )}
      {mode === "reports" &&
        blockId &&
        reportScope === "village" &&
        !villageId && (
          <p className={`${card} text-center text-slate-500`}>
            Select a village to view its report.
          </p>
        )}
      {state.status === "success" &&
      report &&
      (report.integrationPending || !report.answers.length) ? (
        <section className={`${card} text-center`}>
          <h3 className="font-semibold text-slate-900">
            {report.integrationPending
              ? "Survey data will be available after backend integration."
              : "No data available for this location."}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Village and Household Survey results will appear here when submitted
            records are supplied.
          </p>
          <div className="mt-5 grid gap-4 text-left sm:grid-cols-2">
            {[
              { title: "Village Survey", sections: villageSections },
              { title: "Household Survey", sections: householdSections },
            ].map((group) => (
              <div key={group.title} className="rounded-xl bg-slate-50 p-4">
                <h4 className="font-semibold mb-2">{group.title}</h4>
                {group.sections.map((s) => (
                  <p key={s.id} className="text-sm py-1 text-slate-600">
                    {s.title}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {state.status === "success" &&
        report &&
        !report.integrationPending &&
        report.answers.length > 0 && (
          <>
            <Summary report={report} analytics={mode === "analytics"} />
            {mode === "reports" && (
              <>
                <ConsolidatedTables
                  key={`v-${requestKey}`}
                  report={report}
                  kind="Village"
                />
                <ConsolidatedTables
                  key={`h-${requestKey}`}
                  report={report}
                  kind="Household"
                />
              </>
            )}
            {mode === "analytics" && (
              <AdminAnalysis key={requestKey} report={report} />
            )}
          </>
        )}
    </div>
  );
}
function Summary({
  report,
  analytics,
}: {
  report: CompiledReport;
  analytics: boolean;
}) {
  const s = report.summary;
  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-bold">
          {report.blockName} — {report.scopeLabel}
        </h3>
        <p className="text-xs text-slate-500">
          Generated{" "}
          {new Date(report.generatedAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })}{" "}
          (IST)
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Villages included", s.villages],
          ["Village surveys", s.villageRecords],
          ["Household surveys", s.householdRecords],
          ["Population", s.population ?? "No data available"],
          [
            "Households (village responses)",
            s.totalHouseholds ?? "No data available",
          ],
          ["Completed household records", s.completedHouseholds],
          ...(analytics
            ? [
                [
                  "Household completion",
                  s.completion === null
                    ? "No data available"
                    : `${s.completion}%`,
                ],
              ]
            : []),
        ].map(([label, value]) => (
          <div key={label} className={card}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      {analytics && (
        <p className="text-xs text-slate-500">
          Completion denominator: {s.completionDenominator} household records
          with an explicit completion status. Population and household totals
          use village answers only.
        </p>
      )}
    </section>
  );
}
