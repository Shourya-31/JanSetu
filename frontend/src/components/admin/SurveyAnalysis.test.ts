import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { offlineAdminReportService } from "../../services/adminReportService";
import HouseholdSurveyAnalysis from "./HouseholdSurveyAnalysis";
import VillageSurveyAnalysis from "./VillageSurveyAnalysis";
import { AdminDashboard } from "./AdminDashboard";

const villageRecords = [
  {
    id: 21,
    blockId: 3,
    panchayatId: 7,
    villageId: 21,
    blockName: "नारायणपुर",
    panchayatName: "परीक्षण पंचायत",
    villageName: "परीक्षण गाँव",
    affectedStatus: "Direct Affected",
    isCompleted: true,
    data: { fairPriceShop: "नहीं", surveyData: { fairPriceShop: "नहीं" } },
  },
  {
    id: 22,
    blockId: 3,
    panchayatId: 7,
    villageId: 22,
    blockName: "नारायणपुर",
    panchayatName: "परीक्षण पंचायत",
    villageName: "दूसरा गाँव",
    affectedStatus: "Indirect Affected",
    isCompleted: true,
    data: { fairPriceShop: "हाँ", surveyData: { fairPriceShop: "हाँ" } },
  },
];

const householdRecords = [
  {
    id: "house-8",
    houseNumber: 8,
    headName: "परीक्षण परिवार",
    mobile: "9000000000",
    totalMembers: null,
    rationCard: "नहीं",
    blockId: 3,
    panchayatId: 7,
    villageId: 21,
    blockName: "नारायणपुर",
    panchayatName: "परीक्षण पंचायत",
    villageName: "परीक्षण गाँव",
    affectedStatus: "Indirect Affected",
  },
];

describe("admin survey analysis", () => {
  let dom: JSDOM;
  let container: HTMLDivElement;
  let root: Root;
  let requestedUrls: string[];

  beforeEach(() => {
    dom = new JSDOM("<!doctype html><html><body></body></html>");
    vi.stubGlobal("window", dom.window);
    vi.stubGlobal("document", dom.window.document);
    vi.stubGlobal("navigator", dom.window.navigator);
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    requestedUrls = [];
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    dom.window.close();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  async function render(component: ReactNode) {
    await act(async () => {
      root.render(component);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }

  async function click(element: Element | undefined | null) {
    expect(element).not.toBeNull();
    await act(async () => {
      element?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }

  it("opens Statistical Analysis first and places it first in admin navigation", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      officialSource: {
        sourceFile: "source.pdf",
        totalEntries: 0,
        affectedEntries: 0,
        counts: { directOnly: 0, both: 0, indirectOnly: 0, unaffected: 0 },
      },
      blocks: [],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await render(createElement(AdminDashboard, {
      adminId: "admin-1",
      onLogout: vi.fn(),
      service: offlineAdminReportService,
    }));

    const tabs = [...container.querySelectorAll("nav button")];
    expect(tabs[0].textContent).toContain("Statistical Analysis");
    expect(tabs[1].textContent).toContain("Survey Analysis");
    expect(tabs[0].getAttribute("aria-current")).toBe("page");
    expect(container.querySelector("h1#statistical-analysis-title")?.textContent)
      .toBe("Statistical Analysis");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/statistical-analysis",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("uses persisted village answers and keeps the block-to-village hierarchy", async () => {
    await render(createElement(VillageSurveyAnalysis, { villages: villageRecords }));

    await click([...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("शासकीय उचित मूल्य की दुकान"),
    ));
    expect(container.textContent).toContain("1 ब्लॉक");
    expect(container.textContent).toContain("1");

    await click([...container.querySelectorAll("tbody tr")][0]);
    expect(container.textContent).toContain("परीक्षण पंचायत");
    await click([...container.querySelectorAll("tbody tr")][0]);
    expect(container.textContent).toContain("परीक्षण गाँव");
    expect(container.textContent).toContain("नहीं");
    expect(container.textContent).toContain("प्रत्यक्ष प्रभावित");
  });

  it("does not invent household records when the database result is empty", async () => {
    await render(createElement(HouseholdSurveyAnalysis, { households: [] }));

    await click([...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("राशन कार्ड नहीं है"),
    ));
    expect(container.textContent).toContain("कोई कमी वाला रिकॉर्ड उपलब्ध नहीं है");
    expect(container.textContent).not.toContain("अभनपुर");
    expect(container.textContent).not.toContain("रामलाल");
  });

  it("maps household answer aliases and drills down using stable location IDs", async () => {
    await render(createElement(HouseholdSurveyAnalysis, { households: householdRecords }));

    await click([...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("राशन कार्ड नहीं है"),
    ));
    await click([...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("खोलें"),
    ));
    expect(container.textContent).toContain("परीक्षण गाँव");
    await click([...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("खोलें"),
    ));
    expect(container.textContent).toContain("8");
    expect(container.textContent).toContain("परीक्षण परिवार");
    expect(container.textContent).toContain("9000000000");
    expect(container.textContent).toContain("नहीं");
    expect(householdRecords[0].totalMembers).toBeNull();
  });

  it("loads authenticated API records on dashboard entry and retries failed requests", async () => {
    let villageCalls = 0;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      requestedUrls.push(url);
      if (url.includes("/villages")) {
        villageCalls += 1;
        if (villageCalls === 1) {
          return new Response(
            JSON.stringify({ error: { message: "Survey API unavailable" } }),
            { status: 503 },
          );
        }
        return new Response(JSON.stringify({
          records: villageRecords,
          page: 1,
          pageSize: 100,
          total: villageRecords.length,
          totalPages: 1,
        }), { status: 200 });
      }
      return new Response(JSON.stringify({
        records: householdRecords,
        page: 1,
        pageSize: 100,
        total: householdRecords.length,
        totalPages: 1,
      }), { status: 200 });
    }));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await render(createElement(AdminDashboard, {
      adminId: "admin-1",
      onLogout: vi.fn(),
      service: offlineAdminReportService,
    }));
    await click([...container.querySelectorAll("nav button")].find((button) =>
      button.textContent?.includes("Survey Analysis"),
    ));
    await click([...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("ग्राम सर्वे विश्लेषण"),
    ));
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "पेज में unexpected error आया है",
    );
    await click([...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("फिर कोशिश करें"),
    ));

    expect(villageCalls).toBe(2);
    expect(requestedUrls.some((url) =>
      url.includes("/api/admin/survey-analysis/villages?page=1&pageSize=100"),
    )).toBe(true);
    expect(container.textContent).toContain("ग्राम सर्वेक्षण विश्लेषण");
  });
});
