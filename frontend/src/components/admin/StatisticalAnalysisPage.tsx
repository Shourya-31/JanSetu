import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../services/apiClient';

type BlockSummary = {
  totalVillages: number;
  unclassifiedVillages: number;
  unaffectedVillageCount: number;
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

type StatisticalBlock = {
  blockId: number;
  blockName: string;
  isStale: boolean;
  refreshAttempts: number;
  refreshFailed: boolean;
  refreshedAt: string | null;
  sourceUpdatedAt: string | null;
  summary: BlockSummary | null;
};

type OfficialSourceSummary = {
  sourceFile: string;
  totalEntries: number;
  affectedEntries: number;
  counts: {
    directOnly: number;
    both: number;
    indirectOnly: number;
    unaffected: number;
  };
};

type StatisticalAnalysisResponse = {
  blocks: StatisticalBlock[];
  officialSource: OfficialSourceSummary;
};
type ProgressRow = {
  blockId: number | 'total';
  blockName: string;
  totalVillages: number;
  unaffectedVillages: number;
  directVillages: number | null;
  directCompleted: number | null;
  indirectVillages: number | null;
  indirectCompleted: number | null;
  directHouseholds: number | null;
  directHouseholdInput: number | null;
  directHouseholdCompleted: number | null;
  directAverage: number | null;
  indirectHouseholds: number | null;
  indirectHouseholdInput: number | null;
  indirectHouseholdCompleted: number | null;
  indirectAverage: number | null;
  directAverageVillageCount: number;
  indirectAverageVillageCount: number;
  unclassifiedVillages: number;
};

type DrillDownSelection = {
  scope: 'village' | 'household';
  blockId: number | 'total';
  blockIds: number[];
  blockName: string;
  category: 'ALL' | 'DIRECT' | 'INDIRECT' | 'UNAFFECTED' | 'UNCLASSIFIED';
  metric: 'block' | 'total' | 'villages' | 'completed' | 'completion' | 'households' | 'householdCompleted' | 'average' | 'other';
};

type DrillDownVillage = {
  villageId: number;
  villageName: string;
  villageNameHindi: string;
  gramPanchayatName: string;
  gramPanchayatNameHindi: string;
  blockId: number;
  blockName: string;
  affectedStatus: string;
  surveyCompleted?: boolean;
  completionPercent?: number | null;
  householdCount?: number;
  completedHouseholdCount?: number;
  villageCompletionPercent?: number | null;
  households?: { id: string; houseNumber: number; isCompleted: boolean }[];
};

type DrillDownResponse = {
  filter: { blockId: number | null; blockName: string | null; category: DrillDownSelection['category']; metric: DrillDownSelection['metric'] };
  totals: {
    eligibleVillages: number;
    completedVillages: number;
    householdCount: number;
    completedHouseholdCount: number;
    villagesWithoutHouseholds?: number;
    villagesWithHouseholds?: number;
    averagePercent?: number | null;
    metricCount: number;
    completionPercent: number | null;
  };
  records: DrillDownVillage[];
  pagination: { page: number; pageSize: number; totalRecords: number; totalPages: number };
};

function percentage(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator * 100 : null;
}

function sumBlocks(blocks: StatisticalBlock[]): BlockSummary | null {
  if (!blocks.length || blocks.some((block) => !block.summary)) return null;
  return blocks.reduce((total, block) => {
    const item = block.summary!;
    total.totalVillages += item.totalVillages;
    total.unclassifiedVillages += item.unclassifiedVillages;
    total.unaffectedVillageCount += item.unaffectedVillageCount;
    total.directVillageCount += item.directVillageCount;
    total.directVillageSurveysCompleted += item.directVillageSurveysCompleted;
    total.indirectVillageCount += item.indirectVillageCount;
    total.indirectVillageSurveysCompleted += item.indirectVillageSurveysCompleted;
    total.directHouseholdInput += item.directHouseholdInput;
    total.directHouseholdCompleted += item.directHouseholdCompleted;
    total.directVillageHouseholdCompletionPercentSum += item.directVillageHouseholdCompletionPercentSum;
    total.directVillageHouseholdCompletionPercentCount += item.directVillageHouseholdCompletionPercentCount;
    total.indirectHouseholdInput += item.indirectHouseholdInput;
    total.indirectHouseholdCompleted += item.indirectHouseholdCompleted;
    total.indirectVillageHouseholdCompletionPercentSum += item.indirectVillageHouseholdCompletionPercentSum;
    total.indirectVillageHouseholdCompletionPercentCount += item.indirectVillageHouseholdCompletionPercentCount;
    return total;
  }, {
    totalVillages: 0,
    unclassifiedVillages: 0,
    unaffectedVillageCount: 0,
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
  });
}

function toRow(blockId: ProgressRow['blockId'], blockName: string, value: BlockSummary): ProgressRow {
  return {
    blockId,
    blockName,
    totalVillages: value.totalVillages,
    unaffectedVillages: value.unaffectedVillageCount,
    directVillages: value.directVillageCount,
    directCompleted: value.directVillageSurveysCompleted,
    indirectVillages: value.indirectVillageCount,
    indirectCompleted: value.indirectVillageSurveysCompleted,
    directHouseholds: value.directVillageCount,
    directHouseholdInput: value.directHouseholdInput,
    directHouseholdCompleted: value.directHouseholdCompleted,
    directAverage: value.directVillageHouseholdCompletionPercentCount
      ? value.directVillageHouseholdCompletionPercentSum / value.directVillageHouseholdCompletionPercentCount
      : null,
    directAverageVillageCount: value.directVillageHouseholdCompletionPercentCount,
    indirectHouseholds: value.indirectVillageCount,
    indirectHouseholdInput: value.indirectHouseholdInput,
    indirectHouseholdCompleted: value.indirectHouseholdCompleted,
    indirectAverage: value.indirectVillageHouseholdCompletionPercentCount
      ? value.indirectVillageHouseholdCompletionPercentSum / value.indirectVillageHouseholdCompletionPercentCount
      : null,
    indirectAverageVillageCount: value.indirectVillageHouseholdCompletionPercentCount,
    unclassifiedVillages: value.unclassifiedVillages
  };
}

const numberFormatter = new Intl.NumberFormat('en-IN');

function number(value: number | null): string {
  return value === null ? '—' : numberFormatter.format(value);
}

function percent(value: number | null): string {
  return value === null || !Number.isFinite(value) ? '—' : `${value.toFixed(1)}%`;
}

function ProgressCell({ completed, total, onClick, label }: { completed: number; total: number; onClick: () => void; label: string }) {
  const value = percentage(completed, total);
  return (
    <button type="button" onClick={onClick} aria-label={label} className="min-w-32 rounded text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
      <div className="flex items-center justify-between gap-2 text-sm tabular-nums">
        <span>{percent(value)}</span>
        <span className="text-xs text-slate-500">{number(completed)} / {number(total)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-700" style={{ width: `${value === null ? 0 : Math.min(value, 100)}%` }} />
      </div>
    </button>
  );
}

function Table({ rows, type, blockIds, onDrillDown }: {
  rows: ProgressRow[];
  type: 'village' | 'household';
  blockIds: number[];
  onDrillDown: (selection: DrillDownSelection) => void;
}) {
  const household = type === 'household';
  const linkClass = 'cursor-pointer rounded px-1 underline decoration-dotted underline-offset-4 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';
  const select = (row: ProgressRow, category: DrillDownSelection['category'], metric: DrillDownSelection['metric']) => {
    onDrillDown({
      scope: type,
      blockId: row.blockId,
      blockIds: row.blockId === 'total' ? blockIds : [row.blockId],
      blockName: row.blockName,
      category,
      metric
    });
  };
  const metricButton = (row: ProgressRow, category: DrillDownSelection['category'], metric: DrillDownSelection['metric'], value: string, label: string) => (
    <button type="button" className={linkClass} aria-label={label} onClick={() => select(row, category, metric)}>{value}</button>
  );
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-[900px] w-full border-collapse text-sm">
        <caption className="sr-only">{household ? 'Household Progress by Block' : 'Village Progress by Block'}</caption>
        <thead className="sticky top-0 z-10 bg-slate-100 text-slate-800">
          <tr>
            <th scope="col" rowSpan={2} className="border-b border-r border-slate-200 px-4 py-3 text-left font-semibold">Block</th>
            <th scope="col" rowSpan={2} className="border-b border-r border-slate-200 px-4 py-3 text-right font-semibold">Database villages (distinct)</th>
            <th scope="col" rowSpan={2} className="border-b border-r border-slate-200 px-4 py-3 text-right font-semibold">Unaffected / unclassified</th>
            <th scope="colgroup" colSpan={household ? 4 : 3} className="border-b border-r border-slate-200 bg-blue-50 px-4 py-3 text-center font-semibold text-blue-900">Direct affected (includes Both)</th>
            <th scope="colgroup" colSpan={household ? 4 : 3} className="border-b border-slate-200 bg-indigo-50 px-4 py-3 text-center font-semibold text-indigo-900">Indirect affected (indirect-only)</th>
          </tr>
          <tr className="text-xs">
            <th scope="col" className="border-r border-slate-200 px-3 py-2 text-right">Eligible villages</th>
            <th scope="col" className="px-3 py-2 text-right">{household ? 'Households Input' : 'Completed Surveys'}</th>
            <th scope="col" className={household ? 'px-3 py-2 text-right' : 'border-r border-slate-200 px-3 py-2 text-right'}>Completion %</th>
            {household && <th scope="col" className="border-r border-slate-200 px-3 py-2 text-right">Average %</th>}
            <th scope="col" className="px-3 py-2 text-right">Eligible villages</th>
            <th scope="col" className="px-3 py-2 text-right">{household ? 'Households Input' : 'Completed Surveys'}</th>
            <th scope="col" className={household ? 'px-3 py-2 text-right' : 'px-3 py-2 text-right'}>Completion %</th>
            {household && <th scope="col" className="px-3 py-2 text-right">Average %</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const total = row.blockId === 'total';
            const directCompletion = household
              ? percentage(row.directHouseholdCompleted ?? 0, row.directHouseholdInput ?? 0)
              : percentage(row.directCompleted ?? 0, row.directVillages ?? 0);
            const indirectCompletion = household
              ? percentage(row.indirectHouseholdCompleted ?? 0, row.indirectHouseholdInput ?? 0)
              : percentage(row.indirectCompleted ?? 0, row.indirectVillages ?? 0);
            return (
              <tr key={row.blockId} className={total ? 'bg-slate-900 font-bold text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}>
                <th scope="row" className="border-r border-slate-200/60 px-4 py-3 text-left font-semibold">
                  {metricButton(row, 'ALL', 'block', row.blockName, `View ${row.blockName} ${household ? 'household' : 'village'} details`)}
                </th>
                <td className="border-r border-slate-200/60 px-4 py-3 text-right tabular-nums">
                  {metricButton(row, 'ALL', 'total', number(row.totalVillages), `View ${number(row.totalVillages)} distinct villages for ${row.blockName}`)}
                </td>
                <td className="border-r border-slate-200/60 px-4 py-3 text-right tabular-nums">
                  {metricButton(row, 'UNAFFECTED', 'villages', number(row.unaffectedVillages), `View ${number(row.unaffectedVillages)} unaffected villages`)}
                  {' / '}
                  {metricButton(row, 'UNCLASSIFIED', 'villages', number(row.unclassifiedVillages), `View ${number(row.unclassifiedVillages)} unclassified villages`)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{metricButton(row, 'DIRECT', 'villages', number(row.directVillages), `View ${number(row.directVillages)} Direct Affected villages in ${row.blockName}`)}</td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {household
                    ? metricButton(row, 'DIRECT', 'households', number(row.directHouseholdInput), `View ${number(row.directHouseholdInput)} Direct Affected household records in ${row.blockName}`)
                    : metricButton(row, 'DIRECT', 'completed', number(row.directCompleted), `View ${number(row.directCompleted)} completed Direct Affected village surveys in ${row.blockName}`)}
                </td>
                <td className="border-r border-slate-200/60 px-3 py-3 text-right tabular-nums">
                  {household ? (
                    <div className="flex items-center justify-end gap-2">
                      {metricButton(row, 'DIRECT', 'completion', percent(directCompletion), `View Direct Affected household completion records in ${row.blockName}`)}
                      {metricButton(row, 'DIRECT', 'householdCompleted', `${number(row.directHouseholdCompleted)} / ${number(row.directHouseholdInput)}`, `View ${number(row.directHouseholdCompleted)} completed Direct Affected household records in ${row.blockName}`)}
                    </div>
                  ) : <ProgressCell completed={row.directCompleted ?? 0} total={row.directVillages ?? 0} onClick={() => select(row, 'DIRECT', 'completion')} label={`View completed and pending Direct Affected village surveys in ${row.blockName}`} />}
                </td>
                {household && <td className="border-r border-slate-200/60 px-3 py-3 text-right tabular-nums">
                  {metricButton(row, 'DIRECT', 'average', `${percent(row.directAverage)} n=${number(row.directAverageVillageCount)}`, `View Direct Affected village household completion average in ${row.blockName}`)}
                </td>}
                <td className="px-3 py-3 text-right tabular-nums">{metricButton(row, 'INDIRECT', 'villages', number(row.indirectVillages), `View ${number(row.indirectVillages)} Indirect Affected villages in ${row.blockName}`)}</td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {household
                    ? metricButton(row, 'INDIRECT', 'households', number(row.indirectHouseholdInput), `View ${number(row.indirectHouseholdInput)} Indirect Affected household records in ${row.blockName}`)
                    : metricButton(row, 'INDIRECT', 'completed', number(row.indirectCompleted), `View ${number(row.indirectCompleted)} completed Indirect Affected village surveys in ${row.blockName}`)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {household ? (
                    <div className="flex items-center justify-end gap-2">
                      {metricButton(row, 'INDIRECT', 'completion', percent(indirectCompletion), `View Indirect Affected household completion records in ${row.blockName}`)}
                      {metricButton(row, 'INDIRECT', 'householdCompleted', `${number(row.indirectHouseholdCompleted)} / ${number(row.indirectHouseholdInput)}`, `View ${number(row.indirectHouseholdCompleted)} completed Indirect Affected household records in ${row.blockName}`)}
                    </div>
                  ) : <ProgressCell completed={row.indirectCompleted ?? 0} total={row.indirectVillages ?? 0} onClick={() => select(row, 'INDIRECT', 'completion')} label={`View completed and pending Indirect Affected village surveys in ${row.blockName}`} />}
                </td>
                {household && <td className="px-3 py-3 text-right tabular-nums">
                  {metricButton(row, 'INDIRECT', 'average', `${percent(row.indirectAverage)} n=${number(row.indirectAverageVillageCount)}`, `View Indirect Affected village household completion average in ${row.blockName}`)}
                </td>}
              </tr>
            );
          })}
        </tbody>
      </table>
      {household && (
        <p className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
          Average % = arithmetic mean of village-level completion percentages for villages with at least one entered household record (shown as n). Household completion % = completed records / entered household records. Each household record counts once.
        </p>
      )}
    </div>
  );
}

function DrillDownModal({ selection, onClose }: { selection: DrillDownSelection; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const [state, setState] = useState<{
    status: 'loading' | 'success' | 'error';
    key: string;
    data: DrillDownResponse | null;
    error: string;
  }>({ status: 'loading', key: '', data: null, error: '' });
  const categoryLabel = {
    ALL: 'All categories',
    DIRECT: 'Direct affected (includes Both)',
    INDIRECT: 'Indirect affected (indirect-only)',
    UNAFFECTED: 'Unaffected',
    UNCLASSIFIED: 'Unclassified'
  }[selection.category];
  const metricLabel = {
    block: 'Block details',
    total: 'Distinct village total',
    villages: 'Eligible villages',
    completed: 'Completed village surveys',
    completion: 'Survey completion',
    households: 'Entered household records',
    householdCompleted: 'Completed household records',
    average: 'Average village household completion',
    other: 'Pending village surveys'
  }[selection.metric];
  const query = new URLSearchParams({
    scope: selection.scope,
    category: selection.category,
    metric: selection.metric,
    page: String(page),
    pageSize: '25'
  });
  if (selection.blockId === 'total') {
    selection.blockIds.forEach((id) => query.append('blockIds', String(id)));
  } else {
    query.set('blockId', String(selection.blockId));
  }
  const requestPath = `/api/admin/statistical-analysis/details?${query}`;

  useEffect(() => {
    const controller = new AbortController();
    void apiRequest<DrillDownResponse>(requestPath, { signal: controller.signal })
      .then((data) => setState({ status: 'success', key: requestPath, data, error: '' }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            key: requestPath,
            data: null,
            error: error instanceof Error ? error.message : 'Drill-down details could not be loaded.'
          });
        }
      });
    return () => controller.abort();
  }, [requestPath]);

  useEffect(() => {
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', dismissOnEscape);
    return () => window.removeEventListener('keydown', dismissOnEscape);
  }, [onClose]);

  const currentState = state.key === requestPath ? state.status : 'loading';
  const data = state.key === requestPath ? state.data : null;
  const household = selection.scope === 'household';
  const scopeName = household ? 'Household Progress' : 'Village Progress';
  const modalTitle = `${selection.blockName} · ${categoryLabel} · ${metricLabel}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="statistical-drilldown-title"
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">{scopeName} details</p>
              <h2 id="statistical-drilldown-title" className="mt-1 break-words text-lg font-bold text-slate-900 sm:text-xl">{modalTitle}</h2>
              {data && <>
                <p className="mt-2 text-sm text-slate-600">
                  {household
                    ? `${number(data.totals.metricCount)} ${metricLabel.toLowerCase()} matches · ${number(data.totals.householdCount)} household records · ${number(data.totals.completedHouseholdCount)} completed · ${number(data.totals.eligibleVillages)} villages`
                    : `${number(data.totals.metricCount)} records · ${number(data.totals.completedVillages)} completed of ${number(data.totals.eligibleVillages)} eligible villages`}
                </p>
                {household && selection.metric === 'average' && (
                  <p className="mt-1 text-sm text-slate-600">
                    Village-level average: {percent(data.totals.averagePercent ?? null)} across {number(data.totals.villagesWithHouseholds ?? 0)} villages with household records.
                  </p>
                )}
              </>}
            </div>
            <button
              type="button"
              onClick={onClose}
              autoFocus
              aria-label="Close drill-down"
              className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Close
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          {currentState === 'loading' && <p role="status" className="rounded-lg bg-slate-50 p-6 text-sm text-slate-600">Loading records…</p>}
          {currentState === 'error' && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">{state.error}</p>}
          {currentState === 'success' && !data?.records.length && (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No records match this block, category, and metric.</p>
          )}
          {currentState === 'success' && Boolean(data?.records.length) && (
            <>
              {household && (
                <p className="mb-3 text-xs text-slate-600">
                  Village household completion % = completed household records ÷ entered records for that village. Villages with no household records are shown explicitly; no household rows are fabricated.
                </p>
              )}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-[760px] w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-100 text-left text-slate-800">
                    {household ? (
                      <tr>
                        <th scope="col" className="px-3 py-3 font-semibold">Village</th>
                        <th scope="col" className="px-3 py-3 font-semibold">Gram Panchayat</th>
                        <th scope="col" className="px-3 py-3 font-semibold">Household Number</th>
                        <th scope="col" className="px-3 py-3 font-semibold">Household Completed?</th>
                        <th scope="col" className="px-3 py-3 font-semibold">Village Household Completion %</th>
                      </tr>
                    ) : (
                      <tr>
                        <th scope="col" className="px-3 py-3 font-semibold">Village</th>
                        <th scope="col" className="px-3 py-3 font-semibold">Gram Panchayat</th>
                        <th scope="col" className="px-3 py-3 font-semibold">Affected Category</th>
                        <th scope="col" className="px-3 py-3 font-semibold">Survey Status</th>
                        <th scope="col" className="px-3 py-3 font-semibold">Survey Completed</th>
                        <th scope="col" className="px-3 py-3 font-semibold">Completion %</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.records.flatMap((record) => household
                      ? (record.households?.length
                        ? record.households.map((house) => (
                          <tr key={house.id} className="text-slate-700 hover:bg-slate-50">
                            <td className="px-3 py-3">{record.villageName} <span className="block text-xs text-slate-500">{record.villageNameHindi}</span></td>
                            <td className="px-3 py-3">{record.gramPanchayatName}</td>
                            <td className="px-3 py-3 tabular-nums">{house.houseNumber}</td>
                            <td className="px-3 py-3">{house.isCompleted ? 'Completed' : 'Pending'}</td>
                            <td className="px-3 py-3 tabular-nums">{percent(record.villageCompletionPercent ?? null)}</td>
                          </tr>
                        ))
                        : [(
                          <tr key={`empty-${record.villageId}`} className="text-slate-500">
                            <td className="px-3 py-3 text-slate-700">{record.villageName} <span className="block text-xs text-slate-500">{record.villageNameHindi}</span></td>
                            <td className="px-3 py-3">{record.gramPanchayatName}</td>
                            <td className="px-3 py-3" colSpan={2}>No household records entered</td>
                            <td className="px-3 py-3">—</td>
                          </tr>
                        )])
                      : [(
                        <tr key={record.villageId} className="text-slate-700 hover:bg-slate-50">
                          <td className="px-3 py-3">{record.villageName} <span className="block text-xs text-slate-500">{record.villageNameHindi}</span></td>
                          <td className="px-3 py-3">{record.gramPanchayatName}</td>
                          <td className="px-3 py-3">{record.affectedStatus}</td>
                          <td className="px-3 py-3">{record.surveyCompleted ? 'Finalized' : 'Pending / not finalized'}</td>
                          <td className="px-3 py-3">{record.surveyCompleted ? 'Yes' : 'No'}</td>
                          <td className="px-3 py-3 tabular-nums">{percent(record.completionPercent ?? null)}</td>
                        </tr>
                      )])}
                  </tbody>
                </table>
              </div>
              {household && ['block', 'total', 'villages', 'completion'].includes(selection.metric)
                && data?.totals.villagesWithoutHouseholds !== undefined && (
                <p className="mt-3 text-xs text-slate-500">{number(data.totals.villagesWithoutHouseholds)} villages in the selected category have no household records.</p>
              )}
              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
                <span>Village page {data?.pagination.page ?? 1} of {data?.pagination.totalPages ?? 0} · {number(data?.pagination.totalRecords ?? 0)} villages</span>
                <div className="flex gap-2">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-300 px-3 py-2 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                  <button type="button" disabled={!data || page >= data.pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-300 px-3 py-2 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export function StatisticalAnalysisPage() {
  const [state, setState] = useState<{
    status: 'loading' | 'success' | 'error';
    data: StatisticalAnalysisResponse | null;
    error: string;
  }>({ status: 'loading', data: null, error: '' });
  const [drillDown, setDrillDown] = useState<DrillDownSelection | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void apiRequest<StatisticalAnalysisResponse>('/api/admin/statistical-analysis', { signal: controller.signal })
      .then((data) => setState({ status: 'success', data, error: '' }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            data: null,
            error: error instanceof Error ? error.message : 'Statistical analysis could not be loaded.'
          });
        }
      });
    return () => controller.abort();
  }, []);

  const orderedBlocks = useMemo(() => {
    const blocks = state.data?.blocks ?? [];
    return [
      ...blocks.filter((block) => /^orcha$/i.test(block.blockName)),
      ...blocks.filter((block) => /^narayanpur$/i.test(block.blockName))
    ];
  }, [state.data]);
  const combined = useMemo(() => sumBlocks(orderedBlocks), [orderedBlocks]);
  const rows = useMemo(() => {
    if (!combined) return [];
    return [
      ...orderedBlocks.flatMap((block) => block.summary ? [toRow(block.blockId, block.blockName, block.summary)] : []),
      toRow('total', 'Total', combined)
    ];
  }, [combined, orderedBlocks]);
  const stale = orderedBlocks.some((block) => block.isStale);
  const failures = orderedBlocks.filter((block) => block.refreshFailed);
  const unclassified = combined?.unclassifiedVillages ?? 0;
  const latestRefresh = orderedBlocks
    .map((block) => block.refreshedAt)
    .filter((value): value is string => value !== null)
    .sort()
    .at(-1);

  return (
    <section className="mx-auto max-w-7xl space-y-7" aria-labelledby="statistical-analysis-title">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">JanSetu · Administration</p>
        <h1 id="statistical-analysis-title" className="mt-2 text-2xl font-bold text-slate-900">Statistical Analysis</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Village survey and household completion progress for Orcha and Narayanpur.
        </p>
        {state.data?.officialSource && (
          <p className="mt-3 text-xs leading-5 text-slate-600">
            Total villages means distinct village records currently in PostgreSQL. Official source ({state.data.officialSource.sourceFile}) lists {number(state.data.officialSource.totalEntries)} entries: {number(state.data.officialSource.affectedEntries)} affected and {number(state.data.officialSource.counts.unaffected)} unaffected. These are source-list totals; per-village identity reconciliation is tracked separately. Both villages are included only in Direct Affected; Unaffected and unclassified records are excluded from both affected groups.
          </p>
        )}
        {latestRefresh && <p className="mt-3 text-xs text-slate-500">Last refreshed: {new Date(latestRefresh).toLocaleString()}</p>}
      </header>

      {state.status === 'loading' && (
        <p role="status" className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading saved statistical summaries…</p>
      )}
      {state.status === 'error' && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          {state.error}
        </div>
      )}
      {stale && state.status === 'success' && (
        <div role="status" className={`rounded-xl border p-4 text-sm ${failures.length ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-blue-200 bg-blue-50 text-blue-900'}`}>
          {failures.length
            ? 'A summary refresh failed. The last saved results are shown; contact an administrator to retry the rebuild.'
            : 'Some saved summaries are being refreshed. Values shown are the most recent saved results.'}
        </div>
      )}
      {unclassified > 0 && state.status === 'success' && (
        <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {number(unclassified)} villages have missing or invalid classifications and are excluded from affected-category metrics.
        </div>
      )}

      {state.status === 'success' && state.data?.blocks.length === 0 && (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No block records are available for statistical analysis.
        </p>
      )}
      {state.status === 'success' && (state.data?.blocks.length ?? 0) > 0 && !rows.length && (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Saved summaries are not available yet. The backend refresh worker will rebuild them; if this message persists, run <code>npm run db:rebuild-statistical-analysis</code>.
        </p>
      )}
      {state.status === 'success' && rows.length > 0 && (
        <>
          <section aria-labelledby="village-progress-heading" className="space-y-3">
            <div>
              <h2 id="village-progress-heading" className="text-lg font-bold text-slate-900">Village Progress</h2>
              <p className="mt-1 text-xs text-slate-500">Completed = finalized village surveys ÷ eligible villages. Direct includes Direct-only + Both; Indirect includes Indirect-only only. Unaffected and unclassified are excluded.</p>
            </div>
            <Table rows={rows} type="village" blockIds={orderedBlocks.map((block) => block.blockId)} onDrillDown={setDrillDown} />
          </section>
          <section aria-labelledby="household-progress-heading" className="space-y-3">
            <div>
              <h2 id="household-progress-heading" className="text-lg font-bold text-slate-900">Household Progress</h2>
              <p className="mt-1 text-xs text-slate-500">Entered = current household rows; Completed = rows with isCompleted=true. Total completion is summed completed ÷ summed entered; Average % is averaged across eligible villages, not block percentages.</p>
            </div>
            <Table rows={rows} type="household" blockIds={orderedBlocks.map((block) => block.blockId)} onDrillDown={setDrillDown} />
          </section>
        </>
      )}
      {drillDown && <DrillDownModal selection={drillDown} onClose={() => setDrillDown(null)} />}
    </section>
  );
}
