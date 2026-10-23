# Admin Analytics and Consolidated Reports

The Admin frontend uses `liveAdminReportService` for the authenticated database-backed hierarchy, analytics summary, and detailed survey endpoints. `offlineAdminReportService` remains available for isolated tests. The Analytics overview loads automatically at All Districts scope; location filters narrow the same summary, and full survey detail is fetched for a selected village. The current database hierarchy represents Narayanpur as its only district.

## Refined frontend modules

- `src/components/admin/AdminSurveyWorkspace.tsx`: live database location controls; automatically loaded, scope-keyed analytics summaries; independent Entire Block/Single Village report scopes; View Report and export actions; scope-keyed cancellation prevents stale data from being shown/exported.
- `src/components/admin/AdminAnalysis.tsx`: recorded village section tables, village family-count ratios, eligible-household charts, supported child-count ratio, and recorded numeric totals where denominators cannot be determined.
- `src/components/admin/AdminConsolidatedTables.tsx`: searchable section-wise tables, ten survey records per page, consistent stable identifiers, bounded horizontal scrolling, and linked nested saved data. Each household is a row in every relevant section, rather than an individual form.
- `src/utils/adminSurveyValues.ts`: shared missing-value display, numeric validation, and percentage rounding.
- `src/utils/adminAnalyticsMetrics.ts`: reviewed numerator/denominator mappings, invalid-count flags, eligible-household filtering, and person-count ratio calculation.
- `src/utils/adminReportModel.ts`: scope filtering and deduplication, preservation of original answers, calculations, and compilation of the shared table dataset. Household identity includes both village and house number; conflicting duplicate versions for the same household are rejected rather than double-counted.
- `src/utils/adminReportTables.ts`: original section/field ordering, row-oriented primary worksheets, repeated village facility tables, and recursive linked tables for any supplied structured household data.
- `src/utils/adminReportExports.ts`: scope-aware, consolidated PDF print layout and real XLSX workbook. All supplied scope records are exported, irrespective of screen pagination/search.
- `scripts/test-admin-reports.mjs`: isolated development fixtures and calculation, scope, completeness, export round-trip, and rendering checks.

Unchanged supporting interfaces/catalog: `src/types/adminReports.ts` references original form interfaces and household `getData()` return types; `src/data/adminSurveyCatalog.ts` preserves all 119 Village fields and 63 Household fields across 11 sections each. `scripts/generate-admin-catalog.mjs` regenerates the catalog/types after form changes; review dynamic labels/options whenever regenerating. The prior `adminAnalytics.ts` and `analyticsCalculations.ts` files remain preserved and are not used by the new report screens.

## Denominators and eligibility

Village categorical answers are retained as village-specific recorded values, including repeated facilities and multi-selections. They produce no categorical percentages or response-count bars.

`totalHouseholds` is the actual **कुल घर / परिवार संख्या** field. Only these existing general fields use it as a denominator: `puccaHouses`, `rawHouses`, `completedHouses`, `pendingHouses`, `housingNotSanctioned`, and `tapWaterExcludedFamilies`. Each village uses its own count/total pair. Original recorded values are also available in the section tables. Population, schools, health facilities, land, distance, migrant persons, pension beneficiaries, etc. are not divided by families. Missing/zero/non-integer/invalid denominators yield no percentage. A numerator larger than its denominator is explicitly flagged and never clamped.

Household categorical distributions count **eligible answered households**, not people. Each option shows matching household count, eligible denominator, and percentage. `पात्रता नहीं` and `लागू नहीं` are excluded. Follow-up denominators use existing answers:

- `aadhaarEkyc`: households with `rationCard = हाँ`.
- `deathCertificateReceived`: households with `deathInLastYear = हाँ`.
- `assistanceTypes`: households with `needsAssistiveDevice = हाँ`.
- `schoolNotGoingReason`: households with `childrenSchoolStatus = कुछ` or `कोई नहीं`.

Missing or unrecognized controlling answers are excluded as unknown eligibility. Known nonmatching answers are ineligible. Blank responses are excluded. Multi-select options count once per respondent, retain unexpected recorded choices, and may total more than 100%. Stored answers remain untouched and available in Reports, including ineligible answers.

The form contains household summary counts, with no member roster, total-member field, exact ages, literacy data, school-age count, or working-age population. A supported person-count ratio is **childrenWithoutBirthCertificate / children**, using matching counts from the same eligible, deduplicated households. Numerators and denominators are summed across compatible records before division; percentages are never averaged. Incomplete or inconsistent pairs are excluded and disclosed. Available counts from all numeric responses remain visible separately. School attendance, employment, literacy, voter eligibility, etc. are not given invented person denominators; their recorded values/counts remain available.

Percentage formula: matching count / eligible count × 100, rounded to two decimal places. Household completion remains an Analytics summary only, using records with explicit boolean completion status.

## Reports and exports

Reports are independent of Analytics. Entire Block needs only a block; Single Village adds a village selected directly from that block's existing hierarchy, without requiring a panchayat step. Changing blocks resets the village. Missing village selection suppresses loading/exports; scope changes invalidate previous records immediately.

Village tables compare original fields by village and section, with one facility/item row where sections repeat. Household tables have one row per household survey record per section, include original Hindi labels, and retain missing values. Search filters record identities across all fields; pagination applies the same set of ten records across related section tables. These viewing controls do not narrow exports, which always include the entire selected block/village dataset.

Current forms contain no member-level collection. If future supplied answers contain nested saved objects or arrays (including member records), the renderer preserves their original keys in recursively linked tables with village, household, survey record, and original saved source path identifiers. No member schema or member eligibility is fabricated. Checkbox/string arrays remain ordinary multi-select field values.

**Excel** includes Report Summary, Village Survey (one row per village's general answers), Household Survey (one row per household containing every existing field), additional village section sheets, and linked structured-data sheets when supplied. Frozen identifiers/headings, filters, wrapped text, and sheet splitting at Excel's row limit are included. Heading field keys disambiguate similar question labels. Formula-looking responses remain text. Reports/export workbooks contain no percentage-analysis worksheets.

**PDF** opens the complete report in a separate browser print window; choose **Save as PDF**. It uses A4 landscape, original Hindi labels, repeated table headings, section tables, and column groups with repeated identifiers to keep wide forms readable. It contains all records, not only the visible page. No individual household forms or Analytics percentage tables are repeated. Nirmala UI/Mangal support Hindi shaping on Windows. Survey text is escaped before HTML rendering. Final saved-PDF appearance depends on installed fonts/browser print settings. Very large exports use browser memory proportional to the dataset; no records are intentionally truncated.

Both exports consume the same compiled, scope-filtered table dataset as the report screen and label the chosen scope. Single-village filenames identify the village. Exports are disabled for integration-pending or empty datasets; failures display an error.

## Database integration

1. `/api/admin/hierarchy` returns database IDs for block, Gram Panchayat, and village selectors. `/api/admin/analytics` uses optional numeric IDs for scoped summary queries. `/api/admin/surveys` accepts database block/panchayat/village IDs for detailed Reports and selected-village Analytics.
2. The schema contains no district model; current application data is the Narayanpur district hierarchy, so All Districts currently means all available blocks and their related records.
3. Village completion is the explicit `VillageSurvey.isCompleted` submission flag. Household completion is `HouseholdSurvey.isCompleted`. Household saves upsert by the schema's unique `(villageId, houseNumber)` key and increment `version` in place; the report identity is therefore village plus house number, not house number alone.
4. Analytics summaries aggregate village statuses and household completion in the backend. Detailed answers and existing analytics sections remain available at village scope. These changes do not establish production deployment or independently verify production database contents.
5. Existing admin route authentication/authorization guards remain in place. The existing frontend `authApi.ts` behavior is unchanged.

## Validation

Validation for the analytics integration includes backend `npm test` and `npm run build`, frontend `npm test` and `npm run build`, plus scoped source diagnostics. Controller tests mock Prisma and do not connect to or change a database. Tests never supply sample data to the normal Admin screen.

The populated development preview and its sample-data modules have been removed. Admin uses the configured report service; the default service is the live backend adapter.
