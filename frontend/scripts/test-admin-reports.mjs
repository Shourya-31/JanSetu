import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
// Fixtures exist only in this test runner; production imports no test data.
const root = path.resolve(".admin-test");
fs.mkdirSync(root, { recursive: true });
const files = [
  "src/data/adminSurveyCatalog.ts",
  "src/data/narayanpurHierarchy.ts",
  "src/utils/adminReportModel.ts",
  "src/utils/adminSurveyValues.ts",
  "src/utils/adminAnalyticsMetrics.ts",
  "src/utils/adminReportTables.ts",
  "src/utils/adminReportExports.ts",
  "src/services/adminReportService.ts",
  "src/components/admin/AdminDashboard.tsx",
  "src/components/admin/AdminSurveyWorkspace.tsx",
  "src/components/admin/AdminAnalysis.tsx",
  "src/components/admin/AdminConsolidatedTables.tsx",
];
for (const file of files) {
  const out = path.join(root, file.replace(/\.tsx?$/, ".js"));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  let result = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  result = result.replace(
    /(from\s+['"])(\.[^'"]+)(['"])/g,
    (_, a, b, c) => a + b + ".js" + c,
  );
  fs.writeFileSync(out, result);
}
const { compileReport, distribution, numericValue } = await import(
  pathToFileURL(path.join(root, "src/utils/adminReportModel.js"))
);
const { villageSections, householdSections } = await import(
  pathToFileURL(path.join(root, "src/data/adminSurveyCatalog.js"))
);
const { buildReportHtml, createReportWorkbook } = await import(
  pathToFileURL(path.join(root, "src/utils/adminReportExports.js"))
);
const { offlineAdminReportService } = await import(
  pathToFileURL(path.join(root, "src/services/adminReportService.js"))
);
let passed = 0;
async function check(name, fn) {
  await fn();
  passed++;
  console.log("PASS", name);
}
const base = {
  blockId: "b",
  panchayatId: "p",
  villageId: "v",
  villageName: "ग्राम परीक्षण",
  submittedAt: "2026-10-09T06:00:00Z",
};
const village = {
  ...base,
  id: "vs",
  answers: {
    totalPopulation: "100",
    totalHouseholds: "20",
    fairPriceShop: "हाँ",
    schoolData: [
      { schoolName: "विद्यालय", building: "हाँ" },
      { schoolName: "दूसरा", building: "नहीं" },
    ],
    developmentData: { additionalRemarks: "<script>alert(1)</script>" },
  },
};
const hh = (i, answers) => ({
  ...base,
  id: `h${i}`,
  householdId: `house${i}`,
  answers,
});
const households = Array.from({ length: 13 }, (_, i) =>
  hh(i, {
    headName: `परिवार ${i}`,
    isCompleted: i % 2 === 0,
    rationCard: i < 8 ? "हाँ" : "नहीं",
    schoolNotGoingReason: i === 0 ? ["दूरी", "दूरी", "गरीबी"] : [],
    priorityNeed3: "अंतिम प्रश्न",
  }),
);
const dataset = {
  villageSurveys: [village, village],
  householdSurveys: [
    ...households,
    households[0],
    { ...hh(90, {}), blockId: "other" },
  ],
  integrationPending: false,
};
const report = compileReport(
  dataset,
  { blockId: "b" },
  "परीक्षण",
  "2026-10-09T06:00:00Z",
);
await check(
  "complete catalog: 11 sections per form, all 182 fields labeled",
  () => {
    assert.equal(villageSections.length, 11);
    assert.equal(householdSections.length, 11);
    assert.equal(
      [...villageSections, ...householdSections].reduce(
        (n, s) => n + s.fields.length,
        0,
      ),
      182,
    );
    assert.ok(
      [...villageSections, ...householdSections].every((s) =>
        s.fields.every((f) => f.label !== f.key),
      ),
    );
  },
);
await check(
  "categorical answers exclude null, blanks and invalid objects",
  () => {
    const s = distribution(
      [
        { x: "हाँ" },
        { x: "" },
        { x: null },
        { x: "नहीं" },
        { x: {} },
        { x: "  " },
      ],
      { key: "x", type: "categorical", options: ["हाँ", "नहीं"] },
    );
    assert.equal(s.denominator, 2);
    assert.equal(s.options[0].percentage, 50);
  },
);
await check(
  "multi-select counts unique options once, includes unexpected options",
  () => {
    const s = distribution(
      [{ x: ["a", "a", "b"] }, { x: ["b", "c"] }, { x: [" "] }, { x: null }],
      { key: "x", type: "multi-select", options: ["a", "b"] },
    );
    assert.equal(s.denominator, 2);
    assert.equal(s.options.find((o) => o.option === "b").percentage, 100);
    assert.equal(s.options.find((o) => o.option === "c").count, 1);
  },
);
await check(
  "numeric parsing excludes whitespace, infinity, booleans and negatives",
  () => {
    for (const value of [" ", Infinity, true, -1, {}, null])
      assert.equal(numericValue(value), null);
    assert.equal(numericValue("0"), 0);
  },
);
await check(
  "filter and deduplicate before counts, aggregate actual response counts",
  () => {
    assert.equal(report.summary.villageRecords, 1);
    assert.equal(report.summary.householdRecords, 13);
    assert.equal(report.summary.population, 100);
    const stat = report.statistics.find(
      (s) => s.survey === "Household" && s.key === "rationCard",
    );
    assert.equal(stat.denominator, 13);
    assert.equal(stat.options.find((o) => o.option === "हाँ").count, 8);
    assert.equal(
      stat.options.find((o) => o.option === "हाँ").percentage,
      61.54,
    );
  },
);
await check(
  "village categorical percentages removed; repeated facility answers retained",
  () => {
    assert.ok(report.statistics.every((s) => s.survey === "Household"));
    const table = report.tables.find(
      (t) =>
        t.survey === "Village" &&
        t.title === villageSections.find((s) => s.id === "schoolData").title,
    );
    assert.equal(table.rows.length, 2);
    assert.ok(table.rows[0].values.includes("हाँ"));
    assert.ok(table.rows[1].values.includes("नहीं"));
  },
);
await check("reject conflicting duplicate records", () => {
  assert.throws(
    () =>
      compileReport(
        {
          ...dataset,
          villageSurveys: [
            village,
            { ...village, answers: { totalPopulation: "999" } },
          ],
        },
        { blockId: "b" },
        "x",
      ),
    /Conflicting duplicate/,
  );
});
await check("all sections and original answers retained beyond page 1", () => {
  for (const record of households) {
    const rows = report.answers.filter((a) => a.recordId === record.id);
    for (const sec of householdSections)
      assert.ok(rows.some((r) => r.section === sec.title));
    assert.ok(rows.some((r) => r.value === "अंतिम प्रश्न"));
  }
  assert.ok(report.answers.some((r) => r.value === "विद्यालय"));
});
await check(
  "print report escapes saved HTML and includes final record and Hindi",
  () => {
    const html = buildReportHtml(report);
    assert.ok(html.includes("परिवार 12"));
    assert.ok(html.includes("विद्यालय"));
    assert.ok(html.includes("&lt;script&gt;"));
    assert.ok(!html.includes("<script>"));
    assert.ok(html.includes("table-header-group"));
  },
);
await check(
  "workbook round-trip preserves every consolidated household row and all fields",
  async () => {
    const workbook = await createReportWorkbook(report);
    const expected = report.householdSurveys.length;
    assert.equal(
      workbook.getWorksheet("Household Survey").rowCount,
      expected + 1,
    );
    const buffer = await workbook.xlsx.writeBuffer();
    const { default: ExcelJS } = await import("exceljs");
    const loaded = new ExcelJS.Workbook();
    await loaded.xlsx.load(buffer);
    assert.equal(
      loaded.getWorksheet("Household Survey").rowCount,
      expected + 1,
    );
    assert.ok(
      loaded.worksheets.some((sheet) =>
        sheet.getSheetValues().flat(2).includes("विद्यालय"),
      ),
    );
    const headings = loaded.getWorksheet("Household Survey").getRow(1).values;
    for (const field of householdSections.flatMap((s) => s.fields))
      assert.ok(
        headings.some(
          (h) => typeof h === "string" && h.endsWith(`[${field.key}]`),
        ),
      );
    assert.ok(!loaded.getWorksheet("Question Statistics"));
  },
);
await check(
  "offline service returns empty pending state; exports reject it",
  async () => {
    const empty = await offlineAdminReportService.loadSurveys(
      { blockId: "b" },
      new AbortController().signal,
    );
    assert.equal(empty.integrationPending, true);
    const result = compileReport(empty, { blockId: "b" }, "x");
    assert.equal(result.answers.length, 0);
    assert.throws(() => buildReportHtml(result), /backend integration/);
  },
);
await check(
  "Admin defaults to Analytics, has exactly two navigation sections and logout",
  async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { createElement } = await import("react");
    const { AdminDashboard } = await import(
      pathToFileURL(path.join(root, "src/components/admin/AdminDashboard.js"))
    );
    const html = renderToStaticMarkup(
      createElement(AdminDashboard, { adminId: "admin", onLogout: () => {} }),
    );
    assert.ok(html.includes('aria-current="page"'));
    assert.ok(html.includes("Analytics"));
    assert.ok(html.includes("Reports"));
    assert.ok(html.includes("Log Out"));
    assert.ok(html.includes("Select location"));
    assert.ok(!html.includes("Admin Records"));
    assert.ok(!html.includes("Overview"));
  },
);
await check(
  "Reports opens directly with block choice and no Analytics prerequisite",
  async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { createElement } = await import("react");
    const { AdminSurveyWorkspace } = await import(
      pathToFileURL(
        path.join(root, "src/components/admin/AdminSurveyWorkspace.js"),
      )
    );
    const html = renderToStaticMarkup(
      createElement(AdminSurveyWorkspace, {
        mode: "reports",
        service: offlineAdminReportService,
      }),
    );
    assert.ok(html.includes("Narayanpur"));
    assert.ok(html.includes("Orchha"));
    assert.ok(html.includes("Export as PDF"));
    assert.ok(html.includes("Export as Excel"));
    assert.ok(!html.includes("Select district"));
  },
);
await check("free text questions never produce categorical percentages", () => {
  for (const key of [
    "headName",
    "mobile",
    "mainIncomeSource",
    "otherAssistance",
    "otherSchoolReason",
  ]) {
    assert.equal(
      householdSections.flatMap((s) => s.fields).find((f) => f.key === key)
        .type,
      "text",
    );
    assert.ok(
      !report.statistics.some((s) => s.survey === "Household" && s.key === key),
    );
  }
});
await check(
  "multiple versions cannot double-count a village or household",
  () => {
    assert.throws(
      () =>
        compileReport(
          {
            ...dataset,
            villageSurveys: [village, { ...village, id: "different-version" }],
          },
          { blockId: "b" },
          "x",
        ),
      /Multiple village/,
    );
    assert.throws(
      () =>
        compileReport(
          {
            ...dataset,
            householdSurveys: [
              households[0],
              { ...households[0], id: "different-version" },
            ],
          },
          { blockId: "b" },
          "x",
        ),
      /Multiple household/,
    );
  },
);
await check(
  "unknown saved fields are retained without invented percentages",
  () => {
    const result = compileReport(
      {
        ...dataset,
        villageSurveys: [
          {
            ...village,
            answers: { ...village.answers, newSavedAnswer: "अतिरिक्त उत्तर" },
          },
        ],
      },
      { blockId: "b" },
      "x",
    );
    assert.ok(
      result.answers.some(
        (r) => r.key === "newSavedAnswer" && r.value === "अतिरिक्त उत्तर",
      ),
    );
    assert.ok(!result.statistics.some((r) => r.key === "newSavedAnswer"));
  },
);
await check("offline service honors aborted requests", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(() =>
    offlineAdminReportService.loadSurveys({ blockId: "b" }, controller.signal),
  );
});
const { countRatio, FAMILY_COUNT_FIELDS } = await import(
  pathToFileURL(path.join(root, "src/utils/adminAnalyticsMetrics.js"))
);
await check(
  "family ratios use actual totalHouseholds and preserve inconsistent counts",
  () => {
    const data = {
      ...dataset,
      villageSurveys: [
        {
          ...village,
          answers: {
            ...village.answers,
            puccaHouses: "15",
            rawHouses: "25",
            totalHouseholds: "20",
            totalSchools: "6",
          },
        },
      ],
    };
    const result = compileReport(data, { blockId: "b" }, "x");
    const ratio = result.villageFamilyMetrics.find(
      (m) => m.key === "puccaHouses",
    );
    assert.equal(ratio.percentage, 75);
    assert.equal(ratio.numerator, 15);
    assert.equal(ratio.denominator, 20);
    const bad = result.villageFamilyMetrics.find((m) => m.key === "rawHouses");
    assert.equal(bad.numerator, 25);
    assert.equal(bad.percentage, null);
    assert.match(bad.issue, /exceeds/);
    assert.ok(!FAMILY_COUNT_FIELDS.includes("totalSchools"));
    assert.ok(!FAMILY_COUNT_FIELDS.includes("totalPopulation"));
    for (const denominator of [undefined, "", 0, "invalid", -2, 0.5])
      assert.equal(countRatio(3, denominator).percentage, null);
  },
);
await check(
  "household eligibility excludes explicit ineligibility and known follow-up conditions",
  () => {
    const result = compileReport(
      {
        villageSurveys: [],
        integrationPending: false,
        householdSurveys: [
          hh(1, {
            vaccinationStatus: "सभी",
            rationCard: "हाँ",
            aadhaarEkyc: "हाँ",
            deathInLastYear: "हाँ",
            deathCertificateReceived: "हाँ",
          }),
          hh(2, {
            vaccinationStatus: "लागू नहीं",
            rationCard: "नहीं",
            aadhaarEkyc: "नहीं",
            deathInLastYear: "नहीं",
            deathCertificateReceived: "नहीं",
          }),
          hh(3, {
            vaccinationStatus: "नहीं",
            aadhaarEkyc: "हाँ",
            deathCertificateReceived: "हाँ",
          }),
        ],
      },
      { blockId: "b" },
      "x",
    );
    const vaccination = result.statistics.find(
      (s) => s.key === "vaccinationStatus",
    );
    assert.equal(vaccination.denominator, 2);
    assert.equal(vaccination.ineligible, 1);
    assert.ok(!vaccination.options.some((o) => o.option === "लागू नहीं"));
    for (const key of ["aadhaarEkyc", "deathCertificateReceived"]) {
      const s = result.statistics.find((s) => s.key === key);
      assert.equal(s.denominator, 1);
      assert.equal(s.ineligible, 1);
      assert.equal(s.unknownEligibility, 1);
    }
  },
);
await check(
  "person ratio uses eligible child counts rather than household or total population counts",
  () => {
    const result = compileReport(
      {
        villageSurveys: [
          {
            ...village,
            answers: { totalPopulation: "500", totalHouseholds: "200" },
          },
        ],
        householdSurveys: [
          hh(1, { children: "100", childrenWithoutBirthCertificate: "70" }),
          hh(2, { children: "200", childrenWithoutBirthCertificate: "140" }),
          hh(3, {
            childrenWithoutBirthCertificate: "4",
            unemployedMembers: "8",
          }),
        ],
        integrationPending: false,
      },
      { blockId: "b" },
      "x",
    );
    const metric = result.childBirthCertificateMetric;
    assert.equal(metric.numerator, 210);
    assert.equal(metric.denominator, 300);
    assert.equal(metric.percentage, 70);
    assert.equal(metric.excludedRecords, 1);
    assert.equal(
      result.numericStats.find((s) => s.key === "unemployedMembers").total,
      8,
    );
  },
);
await check(
  "missing or inconsistent person eligibility never invents percentages",
  () => {
    const result = compileReport(
      {
        villageSurveys: [],
        householdSurveys: [
          hh(1, { children: "3", childrenWithoutBirthCertificate: "4" }),
          hh(2, { childrenWithoutBirthCertificate: "5" }),
        ],
        integrationPending: false,
      },
      { blockId: "b" },
      "x",
    );
    assert.equal(result.childBirthCertificateMetric.percentage, null);
    assert.equal(result.childBirthCertificateMetric.excludedRecords, 2);
    assert.match(result.childBirthCertificateMetric.issue, /exceed/);
  },
);
await check(
  "nested saved household data becomes linked tables without discarding fields",
  async () => {
    const result = compileReport(
      {
        villageSurveys: [],
        householdSurveys: [
          hh(1, {
            headName: "Parent",
            members: [
              { id: "m1", name: "व्यक्ति", documents: { code: "DOC" } },
              { id: "m2", name: "Second" },
            ],
          }),
        ],
        integrationPending: false,
      },
      { blockId: "b" },
      "x",
    );
    const table = result.tables.find(
      (t) => t.nested && t.title.endsWith("members"),
    );
    assert.equal(table.rows.length, 2);
    assert.ok(table.rows[0].values.includes("व्यक्ति"));
    assert.ok(table.rows[0].values.includes("house1"));
    const documents = result.tables.find((t) =>
      t.title.endsWith("members.documents"),
    );
    assert.ok(documents.rows[0].values.includes("DOC"));
    assert.ok(documents.rows[0].values.includes("members[0].documents"));
    const workbook = await createReportWorkbook(result);
    assert.equal(workbook.getWorksheet("Household Survey").rowCount, 2);
    assert.ok(
      workbook.worksheets.some((s) =>
        s.getSheetValues().flat(2).includes("DOC"),
      ),
    );
    assert.ok(buildReportHtml(result).includes("व्यक्ति"));
  },
);
await check(
  "single-village scope controls every report table and both exports",
  async () => {
    const other = {
      ...village,
      id: "other-village",
      villageId: "v2",
      villageName: "Excluded Village",
    };
    const data = {
      villageSurveys: [village, other],
      householdSurveys: [
        ...households,
        {
          ...hh(99, { headName: "EXCLUDED HOUSEHOLD" }),
          villageId: "v2",
          villageName: "Excluded Village",
        },
      ],
      integrationPending: false,
    };
    const result = compileReport(data, { blockId: "b", villageId: "v" }, "x");
    assert.equal(result.summary.villages, 1);
    assert.equal(result.summary.householdRecords, 13);
    assert.ok(result.scopeLabel.includes("ग्राम परीक्षण"));
    assert.ok(
      result.tables.every((t) =>
        t.rows.every(
          (r) =>
            r.values[t.columns.findIndex((c) => c.key === "villageId")] === "v",
        ),
      ),
    );
    const html = buildReportHtml(result);
    assert.ok(!html.includes("EXCLUDED HOUSEHOLD"));
    assert.ok(!html.includes("Completion percentage"));
    assert.ok(!html.includes("Consolidated Analytics"));
    assert.ok(!html.includes("<progress"));
    const workbook = await createReportWorkbook(result);
    assert.equal(workbook.getWorksheet("Household Survey").rowCount, 14);
    assert.ok(
      !workbook.worksheets.some((s) =>
        s.getSheetValues().flat(2).includes("EXCLUDED HOUSEHOLD"),
      ),
    );
  },
);
await check(
  "Reports renders consolidated tables with no percentages; Analytics retains household charts only",
  async () => {
    const { renderToStaticMarkup } = await import("react-dom/server"),
      { createElement } = await import("react");
    const { ConsolidatedTables } = await import(
      pathToFileURL(
        path.join(root, "src/components/admin/AdminConsolidatedTables.js"),
      )
    );
    const html = renderToStaticMarkup(
      createElement(ConsolidatedTables, { report, kind: "Household" }),
    );
    assert.ok(html.includes("<table"));
    assert.ok(!html.includes("<progress"));
    assert.ok(!html.includes("<dl"));
    assert.ok(html.includes("Search household records"));
    assert.ok(html.includes("Page 1 of 2"));
    const { AdminAnalysis } = await import(
      pathToFileURL(path.join(root, "src/components/admin/AdminAnalysis.js"))
    );
    const analysis = renderToStaticMarkup(
      createElement(AdminAnalysis, { report }),
    );
    assert.ok(analysis.includes("Village Survey — recorded answers"));
    assert.ok(analysis.includes("eligible households"));
    assert.ok(analysis.includes("<progress"));
    assert.ok(!analysis.includes("Valid responses: 1"));
  },
);
await check(
  "assistive-device selections use eligible households and unknown prerequisite values are excluded",
  () => {
    const result = compileReport(
      {
        villageSurveys: [],
        householdSurveys: [
          hh(1, {
            needsAssistiveDevice: "हाँ",
            assistanceTypes: ["व्हीलचेयर"],
          }),
          hh(2, {
            needsAssistiveDevice: "नहीं",
            assistanceTypes: ["व्हीलचेयर"],
          }),
          hh(3, {
            needsAssistiveDevice: "unknown",
            assistanceTypes: ["व्हीलचेयर"],
          }),
        ],
        integrationPending: false,
      },
      { blockId: "b" },
      "x",
    );
    const metric = result.statistics.find((s) => s.key === "assistanceTypes");
    assert.equal(metric.denominator, 1);
    assert.equal(metric.ineligible, 1);
    assert.equal(metric.unknownEligibility, 1);
    assert.equal(metric.options.find((o) => o.option === "व्हीलचेयर").count, 1);
  },
);
console.log(`${passed} checks passed`);
