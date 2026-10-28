import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StatisticalAnalysisPage } from './StatisticalAnalysisPage';

const summary = (values: Partial<Record<string, number>> = {}) => ({
  totalVillages: 10,
  unclassifiedVillages: 0,
  unaffectedVillageCount: 1,
  directVillageCount: 6,
  directVillageSurveysCompleted: 3,
  indirectVillageCount: 3,
  indirectVillageSurveysCompleted: 2,
  directHouseholdInput: 12,
  directHouseholdCompleted: 6,
  directVillageHouseholdCompletionPercentSum: 150,
  directVillageHouseholdCompletionPercentCount: 4,
  indirectHouseholdInput: 8,
  indirectHouseholdCompleted: 4,
  indirectVillageHouseholdCompletionPercentSum: 100,
  indirectVillageHouseholdCompletionPercentCount: 3,
  ...values
});

const analysisResponse = {
  officialSource: {
    sourceFile: 'total village List-2026_Hindi.pdf',
    totalEntries: 413,
    affectedEntries: 290,
    counts: { directOnly: 130, both: 31, indirectOnly: 129, unaffected: 123 }
  },
  blocks: [
    { blockId: 1, blockName: 'Narayanpur', isStale: false, refreshAttempts: 0, refreshFailed: false, refreshedAt: null, sourceUpdatedAt: null, summary: summary() },
    { blockId: 2, blockName: 'Orcha', isStale: false, refreshAttempts: 0, refreshFailed: false, refreshedAt: null, sourceUpdatedAt: null, summary: summary({
      totalVillages: 20,
      unaffectedVillageCount: 1,
      directVillageCount: 11,
      directVillageSurveysCompleted: 8,
      indirectVillageCount: 8,
      indirectVillageSurveysCompleted: 6,
      directVillageHouseholdCompletionPercentSum: 300,
      directVillageHouseholdCompletionPercentCount: 6,
      indirectVillageHouseholdCompletionPercentSum: 200,
      indirectVillageHouseholdCompletionPercentCount: 4
    }) }
  ]
};

describe('StatisticalAnalysisPage', () => {
  let dom: JSDOM;
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    dom = new JSDOM('<!doctype html><html><body></body></html>');
    vi.stubGlobal('window', dom.window);
    vi.stubGlobal('document', dom.window.document);
    vi.stubGlobal('navigator', dom.window.navigator);
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    dom.window.close();
    vi.unstubAllGlobals();
  });

  async function renderPage(response: Response) {
    vi.stubGlobal('fetch', vi.fn(async () => response));
    await act(async () => {
      root.render(createElement(StatisticalAnalysisPage));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }

  it('renders both progress tables and aggregates block summaries', async () => {
    await renderPage(new Response(JSON.stringify(analysisResponse), { status: 200 }));

    const tables = [...container.querySelectorAll('table')];
    expect(tables).toHaveLength(2);
    expect(tables[0].querySelector('caption')?.textContent).toBe('Village Progress by Block');
    expect(tables[1].querySelector('caption')?.textContent).toBe('Household Progress by Block');
    expect(tables[0].textContent).toContain('Total');
    expect(tables[0].textContent).toContain('30');
    expect(tables[0].textContent).toContain('17');
    expect(tables[0].textContent).toContain('11 / 17');
    expect(tables[0].textContent).toContain('64.7%');
    expect(tables[0].textContent).toContain('8 / 11');
    expect(tables[0].textContent).toContain('72.7%');
    expect(tables[0].textContent).toContain('2 / 0');
    expect(tables[1].textContent).toContain('12 / 24');
    expect(tables[1].textContent).toContain('8 / 16');
    expect(tables[1].textContent).toContain('45.0%');
    expect(tables[1].textContent).toContain('42.9%');
    expect(tables[1].textContent).toContain('n=10');
    expect(tables[1].textContent).toContain('n=7');
    expect(container.textContent).toContain('413 entries: 290 affected and 123 unaffected');
  });

  it('renders a distinct empty-data state when there are no blocks', async () => {
    await renderPage(new Response(JSON.stringify({
      officialSource: analysisResponse.officialSource,
      blocks: []
    }), { status: 200 }));
    expect(container.textContent).toContain('No block records are available');
    expect(container.querySelectorAll('table')).toHaveLength(0);
  });

  it('shows API errors instead of substituting summary data', async () => {
    await renderPage(new Response(JSON.stringify({
      success: false,
      error: { message: 'The request could not be completed.' }
    }), { status: 500 }));
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('The request could not be completed.');
    expect(container.querySelectorAll('table')).toHaveLength(0);
  });

  it.skipIf(!process.env.JANSETU_LIVE_ANALYSIS_TOKEN)('renders persisted summaries from the live PostgreSQL-backed API', async () => {
    const token = process.env.JANSETU_LIVE_ANALYSIS_TOKEN!;
    const nativeFetch = globalThis.fetch;
    const liveResponse = await nativeFetch('http://127.0.0.1:8080/api/admin/statistical-analysis', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(liveResponse.status).toBe(200);
    const liveData = await liveResponse.json() as typeof analysisResponse;
    const expectedTotalVillages = liveData.blocks.reduce(
      (total, block) => total + (block.summary?.totalVillages ?? 0),
      0
    );
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(liveData), { status: 200 })));

    await act(async () => {
      root.render(createElement(StatisticalAnalysisPage));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const tables = [...container.querySelectorAll('table')];
    expect(tables).toHaveLength(2);
    expect(tables[0].querySelector('caption')?.textContent).toBe('Village Progress by Block');
    expect(tables[1].querySelector('caption')?.textContent).toBe('Household Progress by Block');
    expect(tables[0].textContent).toContain('Orcha');
    expect(tables[0].textContent).toContain('Narayanpur');
    expect(tables[0].textContent).toContain(new Intl.NumberFormat('en-IN').format(expectedTotalVillages));
  });
});
