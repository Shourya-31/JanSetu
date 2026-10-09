# Admin Analytics and Consolidated Reports

The Admin frontend remains disconnected from the backend. `offlineAdminReportService` makes no HTTP requests and returns an integration-pending empty dataset. Authentication, the two top tabs, Analytics default navigation, logout, location hierarchy, and Surveyor submission code are preserved. This work edits frontend files only; the pre-existing modified backend lockfile was left untouched.

## Refined frontend modules

- `src/components/admin/AdminSurveyWorkspace.tsx`: existing location controls; independent Entire Block/Single Village report scopes; View Report and export actions; scope-keyed cancellation prevents stale data from being shown/exported. Reports show recorded counts and consolidated tables; percentage charts belong only to Analytics.
- `src/components/admin/AdminAnalysis.tsx`: recorded village section tables, village family-count ratios, eligible-household charts, supported child-count ratio, and recorded numeric totals where denominators cannot be determined.
- `src/components/admin/AdminConsolidatedTables.tsx`: searchable section-wise tables, ten survey records per page, consistent stable identifiers, bounded horizontal scrolling, and linked nested saved data. Each household is a row in every relevant section, rather than an individual form.
- `src/utils/adminSurveyValues.ts`: shared missing-value display, numeric validation, and percentage rounding.
- `src/utils/adminAnalyticsMetrics.ts`: reviewed numerator/denominator mappings, invalid-count flags, eligible-household filtering, and person-count ratio calculation.
- `src/utils/adminReportModel.ts`: scope filtering and deduplication, preservation of original answers, calculations, and compilation of the shared table dataset. Identical record IDs deduplicate; conflicting duplicates or multiple survey versions per village/household reject the dataset rather than double-counting.
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

## Future integration mapping

1. Supply a verified authorized adapter implementing `AdminReportService.loadSurveys(scope, signal)`; do not assume an unverified API shape. No API requests/endpoints have been added.
2. Frontend block names/IDs are `narayanpur` / Narayanpur and `orchha-abhujmad` / Orchha (Abhujmad). Narayangaon and Orzha are not in the existing hierarchy. Database location IDs use a different representation; finalize an explicit authoritative mapping during integration.
3. Village general answers are flat, with sections under `anganbadiData`, `schoolData`, `hostelData`, `healthData` (facility arrays) and `waterData`, `employmentData`, `ladiesData`, `cleanlinessData`, `pensionData`, `developmentData` (objects). Household answers are flat `getData()` spreads, not nested section objects.
4. Supply stable `id`, `blockId`, `panchayatId`, `villageId`, `villageName`, complete answers, household identity, timestamps, and explicit completion status when known. Names/house numbers are not stable identity keys.
5. Fetch every eligible page, select one eligible survey version per entity, and fail on incomplete retrieval. Preserve all saved fields. Set `integrationPending: false` only after actual retrieval succeeds.
6. Backend source inspected earlier included Admin analytics/query controllers returning 501, so those summary contracts cannot be presumed usable. Retrieval coverage, authorization, pagination, eligibility metadata, and location relationships must be verified during integration.
7. The existing `authApi.ts` currently returns a mock frontend login session. It is unchanged. This implementation does not establish live backend authentication or claim production authorization is connected.

## Validation

Run `npm run test:admin`, `npm run build`, and scoped ESLint on the modified Admin files. Isolated checks cover complete field labels, missing values, filtering/deduplication, removal of Village categorical percentages, family ratios/inconsistencies, eligible household conditions, paired child counts, unknown denominators, normalized nested data, consolidated household rows, block/village export scope, records beyond page one, Hindi/HTML escaping, XLSX serialization and reload, offline behavior, navigation, and frontend-only rendering. Tests never supply sample data to the normal Admin screen.

The populated development preview and its sample-data modules have been removed. Admin always uses the configured report service; the default remains disconnected until backend integration.
