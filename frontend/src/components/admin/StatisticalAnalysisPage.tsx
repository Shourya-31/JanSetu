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

function ProgressCell({ completed, total }: { completed: number; total: number }) {
  const value = percentage(completed, total);
  return (
    <div className="min-w-32">
      <div className="flex items-center justify-between gap-2 text-sm tabular-nums">
        <span>{percent(value)}</span>
        <span className="text-xs text-slate-500">{number(completed)} / {number(total)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-700" style={{ width: `${value === null ? 0 : Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function Table({ rows, type }: { rows: ProgressRow[]; type: 'village' | 'household' }) {
  const household = type === 'household';
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
                <th scope="row" className="border-r border-slate-200/60 px-4 py-3 text-left font-semibold">{row.blockName}</th>
                <td className="border-r border-slate-200/60 px-4 py-3 text-right tabular-nums">{number(row.totalVillages)}</td>
                <td className="border-r border-slate-200/60 px-4 py-3 text-right tabular-nums">
                  {number(row.unaffectedVillages)} / {number(row.unclassifiedVillages)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{number(household ? row.directVillages : row.directVillages)}</td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {household ? number(row.directHouseholdInput) : number(row.directCompleted)}
                </td>
                <td className="border-r border-slate-200/60 px-3 py-3 text-right tabular-nums">
                  {household ? (
                    <div className="flex items-center justify-end gap-2">
                      <span>{percent(directCompletion)}</span>
                      <span className="text-xs opacity-70">{number(row.directHouseholdCompleted)} / {number(row.directHouseholdInput)}</span>
                    </div>
                  ) : <ProgressCell completed={row.directCompleted ?? 0} total={row.directVillages ?? 0} />}
                </td>
                {household && <td className="border-r border-slate-200/60 px-3 py-3 text-right tabular-nums">{percent(row.directAverage)} <span className="text-xs opacity-70">n={number(row.directAverageVillageCount)}</span></td>}
                <td className="px-3 py-3 text-right tabular-nums">{number(row.indirectVillages)}</td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {household ? number(row.indirectHouseholdInput) : number(row.indirectCompleted)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {household ? (
                    <div className="flex items-center justify-end gap-2">
                      <span>{percent(indirectCompletion)}</span>
                      <span className="text-xs opacity-70">{number(row.indirectHouseholdCompleted)} / {number(row.indirectHouseholdInput)}</span>
                    </div>
                  ) : <ProgressCell completed={row.indirectCompleted ?? 0} total={row.indirectVillages ?? 0} />}
                </td>
                {household && <td className="px-3 py-3 text-right tabular-nums">{percent(row.indirectAverage)} <span className="text-xs opacity-70">n={number(row.indirectAverageVillageCount)}</span></td>}
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

export function StatisticalAnalysisPage() {
  const [state, setState] = useState<{
    status: 'loading' | 'success' | 'error';
    data: StatisticalAnalysisResponse | null;
    error: string;
  }>({ status: 'loading', data: null, error: '' });

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
            <Table rows={rows} type="village" />
          </section>
          <section aria-labelledby="household-progress-heading" className="space-y-3">
            <div>
              <h2 id="household-progress-heading" className="text-lg font-bold text-slate-900">Household Progress</h2>
              <p className="mt-1 text-xs text-slate-500">Entered = current household rows; Completed = rows with isCompleted=true. Total completion is summed completed ÷ summed entered; Average % is averaged across eligible villages, not block percentages.</p>
            </div>
            <Table rows={rows} type="household" />
          </section>
        </>
      )}
    </section>
  );
}
