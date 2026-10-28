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

  it('opens the selected block details, paginates, and dismisses with Escape', async () => {
    const villageDetails = {
      filter: { blockId: 1, blockName: 'Narayanpur', category: 'ALL', metric: 'block' },
      totals: {
        eligibleVillages: 162, completedVillages: 1, householdCount: 0, completedHouseholdCount: 0,
        metricCount: 162, completionPercent: 100 / 162
      },
      records: [{
        villageId: 21, villageName: 'Example village', villageNameHindi: 'उदाहरण',
        gramPanchayatName: 'Panchayat', gramPanchayatNameHindi: 'पंचायत',
        blockId: 1, blockName: 'Narayanpur', affectedStatus: 'Direct Affected',
        surveyCompleted: true, completionPercent: 100
      }],
      pagination: { page: 1, pageSize: 25, totalRecords: 26, totalPages: 2 }
    };
    await renderPage(new Response(JSON.stringify(analysisResponse), { status: 200 }));
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => new Response(
      JSON.stringify(String(input).includes('/details') ? villageDetails : analysisResponse),
      { status: 200 }
    ));
    vi.stubGlobal('fetch', fetchMock);
    const blockButton = container.querySelector<HTMLButtonElement>('[aria-label="View Narayanpur village details"]');
    expect(blockButton).not.toBeNull();
    await act(async () => {
      blockButton!.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('Narayanpur · All categories · Block details');
    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('Example village');
    expect(fetchMock.mock.calls[0][0]).toContain('scope=village');
    expect(fetchMock.mock.calls[0][0]).toContain('blockId=1');

    const next = [...container.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')]
      .find((button) => button.textContent === 'Next');
    expect(next?.textContent).toBe('Next');
    await act(async () => {
      next!.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('page=2'))).toBe(true);

    await act(async () => {
      window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('filters Direct metrics and scopes Total drill-downs to the displayed blocks', async () => {
    const details = {
      filter: { blockId: null, blockName: null, category: 'DIRECT', metric: 'villages' },
      totals: { eligibleVillages: 17, completedVillages: 11, householdCount: 0, completedHouseholdCount: 0, metricCount: 17, completionPercent: 64.7 },
      records: [],
      pagination: { page: 1, pageSize: 25, totalRecords: 17, totalPages: 1 }
    };
    await renderPage(new Response(JSON.stringify(analysisResponse), { status: 200 }));
    const fetchMock = vi.fn(async (...args: [RequestInfo | URL]) => {
      void args;
      return new Response(JSON.stringify(details), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    const directButton = container.querySelector<HTMLButtonElement>('[aria-label="View 6 Direct Affected villages in Narayanpur"]');
    await act(async () => {
      directButton!.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(String(fetchMock.mock.calls[0][0])).toContain('category=DIRECT');
    expect(String(fetchMock.mock.calls[0][0])).toContain('metric=villages');
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[aria-label="Close drill-down"]')!.click();
    });

    const totalButton = container.querySelector<HTMLButtonElement>('[aria-label="View 30 distinct villages for Total"]');
    await act(async () => {
      totalButton!.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    const totalUrl = String(fetchMock.mock.calls[1][0]);
    expect(totalUrl).toContain('blockIds=2');
    expect(totalUrl).toContain('blockIds=1');
  });

  it('renders actual household rows and explicitly reports API failures', async () => {
    const householdDetails = {
      filter: { blockId: 1, blockName: 'Narayanpur', category: 'DIRECT', metric: 'households' },
      totals: {
        eligibleVillages: 99, completedVillages: 1, householdCount: 2, completedHouseholdCount: 1,
        villagesWithoutHouseholds: 97, metricCount: 2, completionPercent: 50
      },
      records: [{
        villageId: 21, villageName: 'Example village', villageNameHindi: 'उदाहरण',
        gramPanchayatName: 'Panchayat', gramPanchayatNameHindi: 'पंचायत',
        blockId: 1, blockName: 'Narayanpur', affectedStatus: 'Direct and Indirect Both',
        householdCount: 2, completedHouseholdCount: 1, villageCompletionPercent: 50,
        households: [
          { id: 'hh-1', houseNumber: 14, isCompleted: true },
          { id: 'hh-2', houseNumber: 22, isCompleted: false }
        ]
      }],
      pagination: { page: 1, pageSize: 25, totalRecords: 99, totalPages: 4 }
    };
    await renderPage(new Response(JSON.stringify(analysisResponse), { status: 200 }));
    let detailCalls = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => new Response(
      String(input).includes('/details') && detailCalls++ === 0
        ? JSON.stringify(householdDetails)
        : JSON.stringify({ error: { message: 'Detail service unavailable.' } }),
      { status: String(input).includes('/details') && detailCalls === 1 ? 200 : 503 }
    ));
    vi.stubGlobal('fetch', fetchMock);
    const householdButton = container.querySelector<HTMLButtonElement>('[aria-label="View Narayanpur household details"]');
    await act(async () => {
      householdButton!.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('14');
    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('22');
    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('Village Household Completion %');
    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('no household rows are fabricated');

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[aria-label="Close drill-down"]')!.click();
      container.querySelector<HTMLButtonElement>('[aria-label="View 6 Direct Affected villages in Narayanpur"]')!
        .dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Detail service unavailable.');
  });

  it('shows loading and empty household results without fabricating records and dismisses outside clicks', async () => {
    const emptyDetails = {
      filter: { blockId: 1, blockName: 'Narayanpur', category: 'INDIRECT', metric: 'households' },
      totals: {
        eligibleVillages: 63, completedVillages: 0, householdCount: 0, completedHouseholdCount: 0,
        villagesWithoutHouseholds: 63, villagesWithHouseholds: 0, averagePercent: null,
        metricCount: 0, completionPercent: null
      },
      records: [],
      pagination: { page: 1, pageSize: 25, totalRecords: 0, totalPages: 0 }
    };
    await renderPage(new Response(JSON.stringify(analysisResponse), { status: 200 }));
    let resolveDetails: ((response: Response) => void) | undefined;
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => String(input).includes('/details')
      ? new Promise<Response>((resolve) => { resolveDetails = resolve; })
      : Promise.resolve(new Response(JSON.stringify(analysisResponse), { status: 200 }))));
    const indirectButton = container.querySelector<HTMLButtonElement>('[aria-label="View 8 Indirect Affected household records in Narayanpur"]');
    await act(async () => {
      indirectButton!.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(container.querySelector('[role="status"]')?.textContent).toContain('Loading records');
    await act(async () => {
      resolveDetails?.(new Response(JSON.stringify(emptyDetails), { status: 200 }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('No records match this block, category, and metric.');
    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('0 household records');
    await act(async () => {
      container.querySelector('[role="dialog"]')!.parentElement!.dispatchEvent(
        new dom.window.MouseEvent('mousedown', { bubbles: true })
      );
    });
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });
});
