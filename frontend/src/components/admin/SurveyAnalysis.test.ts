import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HouseholdSurveyAnalysis from "./HouseholdSurveyAnalysis";
import VillageSurveyAnalysis from "./VillageSurveyAnalysis";
import { AdminDashboard } from "./AdminDashboard";

const hierarchy = [
  {
    id: "3",
    blockName: "नारायणपुर",
    blockNameEnglish: "Narayanpur",
    panchayats: [
      {
        id: "7",
        name: "परीक्षण पंचायत",
        nameEnglish: "Test Panchayat",
        villages: [
          {
            id: "21",
            nameHindi: "परीक्षण गाँव",
            nameEnglish: "Test Village",
            action: "Direct Affected",
            population: 100,
            surveyStatus: "completed" as const,
          },
        ],
      },
    ],
  },
];

const villageResponse = {
  records: [
    {
      id: 21,
      blockId: 3,
      panchayatId: 7,
      villageId: 21,
      blockName: "नारायणपुर",
      panchayatName: "परीक्षण पंचायत",
      villageName: "परीक्षण गाँव",
      affectedStatus: "Direct Affected",
      surveyStatus: "completed",
      isCompleted: true,
      progress: 100,
      totalPopulation: 100,
      data: { totalPopulation: 100 },
    },
  ],
  page: 1,
  pageSize: 25,
  total: 1,
  totalPages: 2,
  stats: {
    total: 1,
    completed: 1,
    incomplete: 0,
    pending: 0,
    completionPercent: 100,
  },
};

const householdResponse = {
  records: [
    {
      id: "house-8",
      houseNumber: 8,
      headName: "परीक्षण परिवार",
      mobile: "9000000000",
      mobileNumber: "9000000000",
      totalMembers: null,
      isCompleted: true,
      completed: true,
      blockName: "नारायणपुर",
      panchayatName: "परीक्षण पंचायत",
      villageName: "परीक्षण गाँव",
    },
  ],
  page: 1,
  pageSize: 25,
  total: 2,
  totalPages: 1,
  stats: {
    total: 2,
    completed: 1,
    incomplete: 1,
    pending: 1,
    completionPercent: 50,
  },
};

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
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        requestedUrls.push(url);
        const payload = url.includes("/api/admin/hierarchy")
          ? hierarchy
          : url.includes("/villages")
            ? villageResponse
            : householdResponse;
        return new Response(JSON.stringify(payload), { status: 200 });
      }),
    );
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    dom.window.close();
    vi.unstubAllGlobals();
  });

  async function render(component: ReactNode) {
    await act(async () => {
      root.render(component);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }

  it("opens on Survey Analysis and keeps Analytics as the secondary navigation option", async () => {
    await render(
      createElement(AdminDashboard, {
        adminId: "admin-1",
        onLogout: vi.fn(),
      }),
    );

    const navigation = container.querySelector('[aria-label="Admin sections"]');
    const buttons = [...(navigation?.querySelectorAll("button") ?? [])];
    expect(buttons.map((button) => button.textContent?.trim())).toEqual([
      "Survey Analysis",
      "Analytics",
      "Statistical Analysis",
      "Reports",
    ]);
    expect(buttons[0]?.getAttribute("aria-current")).toBe("page");
    expect(container.textContent).toContain("विश्लेषण शुरू करने के लिए सर्वे का प्रकार चुनें।");
  });

  it("renders village statuses and sends pagination and location filters to the API", async () => {
    await render(createElement(VillageSurveyAnalysis));

    expect(container.textContent).toContain("कुल गाँव");
    expect(container.textContent).toContain("पूर्ण ग्राम सर्वे");
    expect(container.textContent).toContain("परीक्षण गाँव");
    expect(container.textContent).toContain("पूर्ण");

    const nextButtons = [...container.querySelectorAll("button")].filter(
      (button) => button.textContent?.trim() === "अगला",
    );
    const recordNextButton = nextButtons[nextButtons.length - 1];
    expect(recordNextButton).toBeDefined();
    await act(async () => {
      recordNextButton?.dispatchEvent(
        new dom.window.MouseEvent("click", { bubbles: true }),
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(requestedUrls.some((url) => url.includes("page=2"))).toBe(true);

    const blockSelect = container.querySelector("select");
    expect(blockSelect).not.toBeNull();
    await act(async () => {
      Object.defineProperty(blockSelect, "value", { value: "3", configurable: true });
      blockSelect?.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(requestedUrls.some((url) => url.includes("blockId=3") && url.includes("page=1"))).toBe(true);
  });

  it("renders household data and uses backend completion totals without sample records", async () => {
    await render(createElement(HouseholdSurveyAnalysis));

    expect(container.textContent).toContain("कुल परिवार रिकॉर्ड");
    expect(container.textContent).toContain("परीक्षण परिवार");
    expect(container.textContent).toContain("9000000000");
    expect(container.textContent).toContain("पूर्ण");
    expect(container.textContent).toContain("50%");
    expect(requestedUrls.some((url) => url.includes("/households?page=1&pageSize=25"))).toBe(true);
  });

  it("shows a real empty result without fallback records", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        requestedUrls.push(url);
        const payload = url.includes("/api/admin/hierarchy")
          ? hierarchy
          : {
              records: [],
              page: 1,
              pageSize: 25,
              total: 0,
              totalPages: 0,
              stats: {
                total: 0,
                completed: 0,
                incomplete: 0,
                pending: 0,
                completionPercent: 0,
              },
            };
        return new Response(JSON.stringify(payload), { status: 200 });
      }),
    );
    await render(createElement(VillageSurveyAnalysis));
    expect(container.textContent).toContain("चुने गए फ़िल्टर में कोई ग्राम रिकॉर्ड नहीं मिला।");
    expect(container.textContent).not.toContain("मंगू राम");
  });

  it("shows API failures and retries the failed request", async () => {
    let villageCalls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        requestedUrls.push(url);
        if (url.includes("/api/admin/hierarchy")) {
          return new Response(JSON.stringify(hierarchy), { status: 200 });
        }
        villageCalls += 1;
        if (villageCalls === 1) {
          return new Response(
            JSON.stringify({ error: { message: "Survey API unavailable" } }),
            { status: 503 },
          );
        }
        return new Response(JSON.stringify(villageResponse), { status: 200 });
      }),
    );
    await render(createElement(VillageSurveyAnalysis));
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "Survey API unavailable",
    );
    const retry = [...container.querySelectorAll("button")].find(
      (button) => button.textContent?.includes("फिर कोशिश करें"),
    );
    expect(retry).toBeDefined();
    await act(async () => {
      retry?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(villageCalls).toBe(2);
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });
});
