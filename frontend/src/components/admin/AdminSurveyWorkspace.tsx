import { useEffect, useMemo, useState } from "react";
import {
  householdSections,
  villageSections,
} from "../../data/adminSurveyCatalog";
import type { AdminReportService } from "../../services/adminReportService";
import type {
  AdminAnalyticsSummary,
  AdminLocationBlock,
  SurveyDataset,
} from "../../types/adminReports";
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
  const [hierarchy, setHierarchy] = useState<AdminLocationBlock[]>([]);
  const [hierarchyState, setHierarchyState] = useState<{
    key: number;
    status: "loading" | "success" | "error";
    error: string;
  }>({ key: -1, status: "loading", error: "" });
  const [hierarchyRetry, setHierarchyRetry] = useState(0);
  const [district, setDistrict] = useState(""),
    [blockId, setBlock] = useState(""),
    [panchayatId, setPanchayat] = useState(""),
    [villageId, setVillage] = useState("");
  const [reportScope, setReportScope] = useState<"block" | "village">("block");
  const scopeReady = mode === "reports"
    ? !!blockId && (reportScope === "block" || !!villageId)
    : !!villageId;
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
  const [summaryState, setSummaryState] = useState<{
    key: string;
    status: "idle" | "loading" | "success" | "error";
    data: AdminAnalyticsSummary | null;
    error: string;
  }>({ key: "", status: "idle", data: null, error: "" });
  const block = hierarchy.find((b) => b.id === blockId),
    panchayat = block?.panchayats.find((p) => p.id === panchayatId);
  const selectedVillage = panchayat?.villages.find((v) => v.id === villageId);
  const scopedVillages = hierarchy.flatMap((currentBlock) =>
    (!blockId || currentBlock.id === blockId ? currentBlock.panchayats : [])
      .flatMap((currentPanchayat) =>
        (!panchayatId || currentPanchayat.id === panchayatId ? currentPanchayat.villages : [])
          .filter((village) => !villageId || village.id === villageId)
          .map((village) => ({ ...village, blockName: currentBlock.blockName, panchayatName: currentPanchayat.name }))
      )
  );
  const blockName = block
    ? `${block.blockName} / ${block.blockNameEnglish}`
    : "";
  const scopeHeading = selectedVillage
    ? `${selectedVillage.nameHindi} / ${selectedVillage.nameEnglish} Overview`
    : panchayat
      ? `${panchayat.name} / ${panchayat.nameEnglish} Overview`
      : block
        ? `${block.blockName} / ${block.blockNameEnglish} Block Overview`
        : district
          ? "Narayanpur District Overview"
          : "All Districts Overview";
  const requestKey = JSON.stringify([
    blockId,
    panchayatId,
    activeVillageId,
    reportScope,
    retry,
  ]);
  const summaryKey = JSON.stringify([district, blockId, panchayatId, villageId, retry]);

  useEffect(() => {
    const controller = new AbortController();
    service.loadHierarchy(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setHierarchy(data);
          setHierarchyState({ key: hierarchyRetry, status: "success", error: "" });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setHierarchyState({
          key: hierarchyRetry,
          status: "error",
          error: error instanceof Error ? error.message : "Could not load locations.",
        });
      });
    return () => controller.abort();
  }, [service, hierarchyRetry]);

  useEffect(() => {
    if (mode !== "analytics") return;
    const controller = new AbortController();
    service.loadAnalytics({
      blockId: blockId || undefined,
      panchayatId: panchayatId || undefined,
      villageId: villageId || undefined,
    }, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setSummaryState({ key: summaryKey, status: "success", data, error: "" });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setSummaryState({
            key: summaryKey,
            status: "error",
            data: null,
            error: error instanceof Error ? error.message : "Could not load analytics.",
          });
      });
    return () => controller.abort();
  }, [mode, service, blockId, panchayatId, villageId, summaryKey]);

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
            ? "Database-backed overview across all districts, with optional location filters."
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
                <option value="">All Districts</option>
                <option value="narayanpur">नारायणपुर / Narayanpur</option>
              </select>
            </label>
          )}
          <label className="text-xs font-semibold space-y-2">
            <span>Block / विकासखंड</span>
            <select
              className={control}
              value={blockId}
              onChange={(e) => changeBlock(e.target.value)}
            >
              <option value="">Select block</option>
                {hierarchy.map((b) => (
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
      {hierarchyState.key !== hierarchyRetry && (
        <p role="status" className="text-sm text-slate-500">Loading locations…</p>
      )}
      {hierarchyState.key === hierarchyRetry && hierarchyState.status === "error" && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {hierarchyState.error}
          <button className="ml-3 underline" onClick={() => setHierarchyRetry((n) => n + 1)}>
            Retry
          </button>
        </div>
      )}
      {mode === "analytics" && (
        <section className={card} aria-label="Analytics overview">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">{scopeHeading}</h3>
            <p className="mt-1 text-xs text-slate-500">
              Aggregated from current database records. Completed surveys use the submitted status stored for each village or household.
            </p>
          </div>
          {(summaryState.key !== summaryKey || summaryState.status === "loading") && (
            <p role="status" className="text-sm text-slate-500">Loading analytics…</p>
          )}
          {summaryState.key === summaryKey && summaryState.status === "error" && (
            <div role="alert" className="text-sm text-rose-800">
              {summaryState.error}
              <button className="ml-3 underline" onClick={() => setRetry((n) => n + 1)}>
                Retry
              </button>
            </div>
          )}
          {summaryState.key === summaryKey && summaryState.status === "success" && summaryState.data && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {[
                  ["Districts", summaryState.data.districts],
                  ["Blocks", summaryState.data.blocks],
                  ["Gram Panchayats", summaryState.data.gramPanchayats],
                  ["Villages", summaryState.data.villages],
                  ["Village surveys completed", summaryState.data.villageSurveysCompleted],
                  ["Village surveys pending", summaryState.data.villageSurveysPending],
                  ["Village completion", `${summaryState.data.villageCompletionPercent}%`],
                  ["Household survey records", summaryState.data.householdRecords],
                  ["Households completed", summaryState.data.completedHouseholdRecords],
                  ["Household completion", summaryState.data.householdCompletionPercent === null ? "Unavailable" : `${summaryState.data.householdCompletionPercent}%`],
                  ["Population from village surveys", summaryState.data.population === null ? "Unavailable" : summaryState.data.population.toLocaleString("en-IN")],
                  ["Household total from village surveys", summaryState.data.totalHouseholds === null ? "Unavailable" : summaryState.data.totalHouseholds.toLocaleString("en-IN")],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Village survey status: {summaryState.data.villageSurveysIncomplete} incomplete, {summaryState.data.villageSurveysUnavailable} unavailable. Household records: {summaryState.data.incompleteHouseholdRecords} incomplete of {summaryState.data.householdRecords}. Population values available for {summaryState.data.populationResponses} villages; household totals available for {summaryState.data.householdTotalResponses} villages.
              </p>
              {scopedVillages.length > 0 && (
                <section className="mt-5 border-t border-slate-200 pt-4" aria-label="Village survey statuses">
                  <h4 className="mb-3 text-sm font-semibold text-slate-800">Village survey status</h4>
                  <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                    {scopedVillages.map((village) => {
                      const completed = village.surveyStatus === "completed";
                      const unavailable = village.surveyStatus === "unavailable";
                      return (
                        <li key={village.id} className="flex items-center justify-between gap-3 px-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">{village.nameHindi} / {village.nameEnglish}</p>
                            <p className="truncate text-xs text-slate-500">{village.blockName} · {village.panchayatName}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${completed ? "bg-emerald-100 text-emerald-800" : unavailable ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
                            {completed ? "Completed" : unavailable ? "Unavailable" : "Incomplete"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
              {summaryState.data.villages === 0 && (
                <p className="mt-4 text-sm text-slate-500">No villages are available in this scope.</p>
              )}
            </>
          )}
        </section>
      )}
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
      {mode === "reports" && !blockId && (
        <div className={`${card} text-center text-slate-500`}>
          Select a block to begin.
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
            <Summary
              report={report}
              analytics={mode === "analytics"}
            />
            {activeVillageId && <VillagePhotoGallery report={report} />}
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

function VillagePhotoGallery({ report }: { report: CompiledReport }) {
  const photos = report.villageSurveys.flatMap((survey) =>
    Array.isArray(survey.answers.villagePhotos)
      ? survey.answers.villagePhotos.filter(
          (photo): photo is string =>
            typeof photo === "string" && photo.trim().length > 0,
        )
      : [],
  );

  if (!photos.length) {
    return (
      <section className={card}>
        <h3 className="font-bold">Village photos</h3>
        <p className="mt-2 text-sm text-slate-500">
          No photos were uploaded for this village.
        </p>
      </section>
    );
  }

  return (
    <section className={card}>
      <h3 className="font-bold">Village photos</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {photos.map((photo, index) => (
          <a
            key={`${photo}-${index}`}
            href={photo}
            target="_blank"
            rel="noreferrer"
            className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
          >
            <img
              src={photo}
              alt={`Village photo ${index + 1}`}
              loading="lazy"
              className="h-32 w-full object-cover transition-transform hover:scale-105"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
