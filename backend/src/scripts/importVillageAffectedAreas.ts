import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Prisma, PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import sourceData from '../data/officialVillageAffectedAreas2026.json';
import prisma from '../config/prisma';
import {
  affectedVillageCounts,
  VILLAGE_AFFECTED_STATUS,
  type VillageAffectedStatus
} from '../utils/villageAffectedStatus';
import {
  rankVillageCandidates,
  rankParentNameCandidates,
  toCsv,
  type ReconciliationCandidate,
  type ReconciliationIdentity
} from '../utils/villageReconciliation';

dotenv.config();

type OfficialStatus =
  | 'प्रत्यक्ष प्रभावित'
  | 'प्रत्यक्ष एवं अप्रत्यक्ष दोनों'
  | 'अप्रत्यक्ष प्रभावित'
  | 'अप्रभावित';

type OfficialEntry = {
  serial: number;
  district: string;
  block: string;
  gramPanchayat: string;
  village: string;
  officialStatus: OfficialStatus;
};

type OfficialSource = {
  sourceTitle: string;
  sourceFileName: string;
  entryCount: number;
  entries: OfficialEntry[];
};

type LocationDatabase = Pick<PrismaClient, 'block'>;
type BlockSnapshot = Prisma.BlockGetPayload<{
  include: {
    gramPanchayats: {
      include: { villages: true };
    };
  };
}>;

const source = sourceData as OfficialSource;
const expectedStatusCounts: Record<OfficialStatus, number> = {
  'प्रत्यक्ष प्रभावित': 130,
  'प्रत्यक्ष एवं अप्रत्यक्ष दोनों': 31,
  'अप्रत्यक्ष प्रभावित': 129,
  'अप्रभावित': 123
};
const canonicalStatus: Record<OfficialStatus, VillageAffectedStatus> = {
  'प्रत्यक्ष प्रभावित': VILLAGE_AFFECTED_STATUS.DIRECT,
  'प्रत्यक्ष एवं अप्रत्यक्ष दोनों': VILLAGE_AFFECTED_STATUS.BOTH,
  'अप्रत्यक्ष प्रभावित': VILLAGE_AFFECTED_STATUS.INDIRECT,
  'अप्रभावित': VILLAGE_AFFECTED_STATUS.UNAFFECTED
};
const EXPECTED_DISTRICT = 'नारायणपुर';

function normalizeName(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .toLocaleLowerCase('hi-IN');
}

function normalizeSpacing(value: string): string {
  return normalizeName(value).replace(/\s/gu, '');
}

function sha256(contents: Buffer | string): string {
  return createHash('sha256').update(contents).digest('hex');
}

function validateSource(): Record<OfficialStatus, number> {
  if (source.entryCount !== 413 || source.entries.length !== 413) {
    throw new Error(`Official source must contain 413 entries; found ${source.entries.length}.`);
  }

  const serials = new Set(source.entries.map((entry) => entry.serial));
  if (serials.size !== 413 || source.entries.some((entry) => !Number.isInteger(entry.serial) || entry.serial < 1 || entry.serial > 413)) {
    throw new Error('Official source serial numbers must uniquely cover 1 through 413.');
  }

  const counts = Object.fromEntries(
    Object.keys(expectedStatusCounts).map((status) => [
      status,
      source.entries.filter((entry) => entry.officialStatus === status).length
    ])
  ) as Record<OfficialStatus, number>;

  for (const [status, expected] of Object.entries(expectedStatusCounts) as [OfficialStatus, number][]) {
    if (counts[status] !== expected) {
      throw new Error(`Official source status count mismatch for "${status}": expected ${expected}, found ${counts[status]}.`);
    }
  }

  if (source.entries.some((entry) => !entry.district || !entry.block || !entry.gramPanchayat || !entry.village)) {
    throw new Error('Official source contains an entry with an incomplete administrative identity.');
  }
  if (source.entries.some((entry) => normalizeName(entry.district) !== normalizeName(EXPECTED_DISTRICT))) {
    throw new Error(`Official source contains an entry outside district "${EXPECTED_DISTRICT}".`);
  }

  return counts;
}

async function loadSnapshot(database: LocationDatabase): Promise<BlockSnapshot[]> {
  return database.block.findMany({
    orderBy: { id: 'asc' },
    include: {
      gramPanchayats: {
        orderBy: { id: 'asc' },
        include: { villages: { orderBy: { id: 'asc' } } }
      }
    }
  });
}

function snapshotFingerprint(blocks: BlockSnapshot[]): string {
  const stableSnapshot = blocks.map((block) => ({
    id: block.id,
    nameHindi: block.nameHindi,
    nameEnglish: block.nameEnglish,
    totalVillages: block.totalVillages,
    directAffectedVillages: block.directAffectedVillages,
    indirectAffectedVillages: block.indirectAffectedVillages,
    gramPanchayats: block.gramPanchayats.map((panchayat) => ({
      id: panchayat.id,
      nameHindi: panchayat.nameHindi,
      nameEnglish: panchayat.nameEnglish,
      totalVillages: panchayat.totalVillages,
      directAffectedVillages: panchayat.directAffectedVillages,
      indirectAffectedVillages: panchayat.indirectAffectedVillages,
      villages: panchayat.villages.map((village) => ({
        id: village.id,
        nameHindi: village.nameHindi,
        nameEnglish: village.nameEnglish,
        affectedStatus: village.affectedStatus
      }))
    }))
  }));
  return sha256(JSON.stringify(stableSnapshot));
}

function getUniqueNameMatch<T>(
  candidates: T[],
  getNames: (candidate: T) => string[],
  officialName: string
): { match: T | null; ambiguous: T[]; mode: 'exact' | 'whitespace-normalized' | null } {
  const officialKey = normalizeName(officialName);
  const exact = candidates.filter((candidate) =>
    getNames(candidate).some((name) => normalizeName(name) === officialKey)
  );
  if (exact.length === 1) return { match: exact[0], ambiguous: [], mode: 'exact' };
  if (exact.length > 1) return { match: null, ambiguous: exact, mode: null };

  const spacingKey = normalizeSpacing(officialName);
  const spacingMatches = candidates.filter((candidate) =>
    getNames(candidate).some((name) => normalizeSpacing(name) === spacingKey)
  );
  if (spacingMatches.length === 1) {
    return { match: spacingMatches[0], ambiguous: [], mode: 'whitespace-normalized' };
  }
  return {
    match: null,
    ambiguous: spacingMatches,
    mode: null
  };
}

type PlannedEntry =
  | {
      serial: number;
      operation: 'update';
      villageId: number;
      proposedStatus: VillageAffectedStatus;
      currentStatus: string;
    }
  | {
      serial: number;
      operation: 'create';
      gramPanchayatId: number;
      villageName: string;
      proposedStatus: VillageAffectedStatus;
    };

export async function buildDryRun(database: LocationDatabase) {
  const sourceCounts = validateSource();
  const blocks = await loadSnapshot(database);
  const sourceHash = sha256(fs.readFileSync(path.join(__dirname, '../data/officialVillageAffectedAreas2026.json')));
  const databaseHash = snapshotFingerprint(blocks);
  const results: Record<string, unknown>[] = [];
  const plan: PlannedEntry[] = [];
  const matchedIds = new Set<number>();
  const sourceIdentities = new Map<string, number[]>();
  const countsByBlock = new Map<string, Record<string, number>>();
  const dbById = new Map<number, { block: BlockSnapshot; panchayat: BlockSnapshot['gramPanchayats'][number]; village: BlockSnapshot['gramPanchayats'][number]['villages'][number] }>();
  const allCandidates: ReconciliationCandidate[] = [];
  const statusCounts = Object.keys(expectedStatusCounts) as OfficialStatus[];

  for (const entry of source.entries) {
    const identity = [
      normalizeName(entry.block),
      normalizeName(entry.gramPanchayat),
      normalizeSpacing(entry.village)
    ].join('|');
    sourceIdentities.set(identity, [...(sourceIdentities.get(identity) ?? []), entry.serial]);
  }

  for (const block of blocks) {
    for (const panchayat of block.gramPanchayats) {
      for (const village of panchayat.villages) {
        dbById.set(village.id, { block, panchayat, village });
        allCandidates.push({
          villageId: village.id,
          blockId: block.id,
          gramPanchayatId: panchayat.id,
          block: block.nameHindi,
          blockEnglish: block.nameEnglish,
          gramPanchayat: panchayat.nameHindi,
          gramPanchayatEnglish: panchayat.nameEnglish,
          village: village.nameHindi,
          villageEnglish: village.nameEnglish,
          currentStatus: village.affectedStatus
        });
      }
    }
  }

  for (const entry of source.entries) {
    const identity = [
      normalizeName(entry.block),
      normalizeName(entry.gramPanchayat),
      normalizeSpacing(entry.village)
    ].join('|');
    const blockMatches = getUniqueNameMatch(blocks, (block) => [block.nameHindi, block.nameEnglish], entry.block);
    const proposedStatus = canonicalStatus[entry.officialStatus];
    const result: Record<string, unknown> = {
      serial: entry.serial,
      district: entry.district,
      block: entry.block,
      gramPanchayat: entry.gramPanchayat,
      village: entry.village,
      officialStatus: entry.officialStatus,
      proposedStatus,
      matchStatus: 'unresolved'
    };
    result.potentialMatches = rankVillageCandidates(entry, allCandidates);

    if (!blockMatches.match) {
      result.matchStatus = blockMatches.ambiguous.length ? 'ambiguous-block' : 'missing-block';
      result.candidates = blockMatches.ambiguous.map((block) => ({ id: block.id, nameHindi: block.nameHindi, nameEnglish: block.nameEnglish }));
      results.push(result);
      continue;
    }

    const block = blockMatches.match;
    result.blockId = block.id;
    const panchayatMatches = getUniqueNameMatch(
      block.gramPanchayats,
      (panchayat) => [panchayat.nameHindi, panchayat.nameEnglish],
      entry.gramPanchayat
    );
    if (!panchayatMatches.match) {
      result.matchStatus = panchayatMatches.ambiguous.length ? 'ambiguous-gram-panchayat' : 'missing-gram-panchayat';
      result.candidates = panchayatMatches.ambiguous.map((panchayat) => ({
        id: panchayat.id,
        nameHindi: panchayat.nameHindi,
        nameEnglish: panchayat.nameEnglish
      }));
      result.parentNameSuggestions = rankParentNameCandidates(
        entry.gramPanchayat,
        block.gramPanchayats.map((candidate) => ({
          id: candidate.id,
          nameHindi: candidate.nameHindi,
          nameEnglish: candidate.nameEnglish
        }))
      );
      if (!panchayatMatches.ambiguous.length) {
        result.villageNameCandidates = block.gramPanchayats.flatMap((candidatePanchayat) =>
          candidatePanchayat.villages
            .filter((village) =>
              normalizeName(village.nameHindi) === normalizeName(entry.village)
              || normalizeSpacing(village.nameHindi) === normalizeSpacing(entry.village)
            )
            .map((village) => ({
              gramPanchayatId: candidatePanchayat.id,
              gramPanchayat: candidatePanchayat.nameHindi,
              villageId: village.id,
              village: village.nameHindi,
              currentStatus: village.affectedStatus
            }))
        );
      }
      results.push(result);
      continue;
    }

    const panchayat = panchayatMatches.match;
    result.gramPanchayatId = panchayat.id;
    result.parentMatch = panchayatMatches.mode;
    const villageMatches = getUniqueNameMatch(
      panchayat.villages,
      (village) => [village.nameHindi, village.nameEnglish],
      entry.village
    );
    if (villageMatches.match) {
      const village = villageMatches.match;
      if (matchedIds.has(village.id)) {
        result.matchStatus = 'duplicate-official-entry';
        result.villageId = village.id;
        result.candidateSerials = sourceIdentities.get(identity) ?? [];
        results.push(result);
        continue;
      }
      matchedIds.add(village.id);
      result.matchStatus = villageMatches.mode === 'exact' ? 'matched' : 'matched-whitespace-normalized';
      result.villageId = village.id;
      result.currentStatus = village.affectedStatus;
      result.classificationChangeRequired = village.affectedStatus !== proposedStatus;
      plan.push({
        serial: entry.serial,
        operation: 'update',
        villageId: village.id,
        currentStatus: village.affectedStatus,
        proposedStatus
      });
      results.push(result);
      continue;
    }

    if (villageMatches.ambiguous.length) {
      result.matchStatus = 'ambiguous-village';
      result.candidates = villageMatches.ambiguous.map((village) => ({
        id: village.id,
        nameHindi: village.nameHindi,
        nameEnglish: village.nameEnglish
      }));
      results.push(result);
      continue;
    }

    const sameNameElsewhereInBlock = block.gramPanchayats.flatMap((candidatePanchayat) =>
      candidatePanchayat.villages
        .filter((village) =>
          normalizeName(village.nameHindi) === normalizeName(entry.village)
          || normalizeSpacing(village.nameHindi) === normalizeSpacing(entry.village)
        )
        .map((village) => ({
          gramPanchayatId: candidatePanchayat.id,
          gramPanchayat: candidatePanchayat.nameHindi,
          villageId: village.id,
          village: village.nameHindi
        }))
    );
    if (sameNameElsewhereInBlock.length) {
      result.matchStatus = 'village-name-exists-under-different-panchayat';
      result.candidates = sameNameElsewhereInBlock;
      results.push(result);
      continue;
    }

    if ((sourceIdentities.get(identity)?.length ?? 0) > 1) {
      result.matchStatus = 'duplicate-official-identity';
      result.candidateSerials = sourceIdentities.get(identity);
      results.push(result);
      continue;
    }

    result.matchStatus = 'safe-to-create';
    result.currentStatus = null;
    result.classificationChangeRequired = true;
    result.nameEnglishForCreation = entry.village;
    plan.push({
      serial: entry.serial,
      operation: 'create',
      gramPanchayatId: panchayat.id,
      villageName: entry.village,
      proposedStatus
    });
    results.push(result);
  }

  for (const result of results) {
    if (typeof result.block === 'string') {
      const key = normalizeName(result.block);
      const blockCount = countsByBlock.get(key) ?? Object.fromEntries(statusCounts.map((status) => [status, 0]));
      if (typeof result.officialStatus === 'string') blockCount[result.officialStatus] += 1;
      countsByBlock.set(key, blockCount);
    }
  }

  const databaseVillagesAbsentFromSource = [...dbById.values()]
    .filter(({ village }) => !matchedIds.has(village.id))
    .map(({ block, panchayat, village }) => {
      const identity: ReconciliationIdentity = {
        block: block.nameHindi,
        blockEnglish: block.nameEnglish,
        gramPanchayat: panchayat.nameHindi,
        gramPanchayatEnglish: panchayat.nameEnglish,
        village: village.nameHindi,
        villageEnglish: village.nameEnglish
      };
      const possibleOfficialEntries = rankVillageCandidates(identity, source.entries.map((entry) => ({
        villageId: entry.serial,
        blockId: 0,
        gramPanchayatId: 0,
        block: entry.block,
        gramPanchayat: entry.gramPanchayat,
        village: entry.village,
        currentStatus: entry.officialStatus
      }))).map((candidate) => ({
        serial: candidate.villageId,
        block: candidate.block,
        gramPanchayat: candidate.gramPanchayat,
        village: candidate.village,
        officialStatus: candidate.currentStatus,
        score: candidate.score,
        evidence: candidate.evidence
      }));
      return {
        villageId: village.id,
        blockId: block.id,
        block: block.nameHindi,
        blockEnglish: block.nameEnglish,
        gramPanchayatId: panchayat.id,
        gramPanchayat: panchayat.nameHindi,
        gramPanchayatEnglish: panchayat.nameEnglish,
        village: village.nameHindi,
        villageEnglish: village.nameEnglish,
        currentStatus: village.affectedStatus,
        possibleOfficialEntries
      };
    });
  const resultCounts = results.reduce<Record<string, number>>((counts, result) => {
    const status = String(result.matchStatus);
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});
  const matched = results.filter((result) =>
    result.matchStatus === 'matched' || result.matchStatus === 'matched-whitespace-normalized'
  );
  const changed = matched.filter((result) => result.classificationChangeRequired === true);
  const alreadyCorrect = matched.filter((result) => result.classificationChangeRequired === false);
  const unresolvedOfficialEntries = results.filter((result) =>
    result.matchStatus !== 'matched'
    && result.matchStatus !== 'matched-whitespace-normalized'
    && result.matchStatus !== 'safe-to-create'
  );
  const counterReconciliation: Record<string, unknown>[] = [];
  for (const block of blocks) {
    const blockVillageStatuses = block.gramPanchayats.flatMap(
      (panchayat) => panchayat.villages.map((village) => village.affectedStatus)
    );
    const blockCounts = affectedVillageCounts(blockVillageStatuses);
    counterReconciliation.push({
      scope: 'block',
      blockId: block.id,
      block: block.nameHindi,
      stored: {
        totalVillages: block.totalVillages,
        directAffectedVillages: block.directAffectedVillages,
        indirectAffectedVillages: block.indirectAffectedVillages
      },
      calculatedFromCurrentVillageRecords: blockCounts,
      needsReconciliation:
        block.totalVillages !== blockCounts.totalVillages
        || block.directAffectedVillages !== blockCounts.directAffectedVillages
        || block.indirectAffectedVillages !== blockCounts.indirectAffectedVillages
    });
    for (const panchayat of block.gramPanchayats) {
      const counts = affectedVillageCounts(panchayat.villages.map((village) => village.affectedStatus));
      counterReconciliation.push({
        scope: 'gramPanchayat',
        blockId: block.id,
        block: block.nameHindi,
        gramPanchayatId: panchayat.id,
        gramPanchayat: panchayat.nameHindi,
        stored: {
          totalVillages: panchayat.totalVillages,
          directAffectedVillages: panchayat.directAffectedVillages,
          indirectAffectedVillages: panchayat.indirectAffectedVillages
        },
        calculatedFromCurrentVillageRecords: counts,
        needsReconciliation:
          panchayat.totalVillages !== counts.totalVillages
          || panchayat.directAffectedVillages !== counts.directAffectedVillages
          || panchayat.indirectAffectedVillages !== counts.indirectAffectedVillages
      });
    }
  }

  const unresolvedCount = unresolvedOfficialEntries.length + databaseVillagesAbsentFromSource.length;
  const applyReady = unresolvedCount === 0;
  const countersNeedingReconciliation = counterReconciliation.filter(
    (counter) => counter.needsReconciliation === true
  );

  return {
    generatedAt: new Date().toISOString(),
    mode: 'dry-run',
    sourceFile: source.sourceFileName,
    sourceTitle: source.sourceTitle,
    sourceSha256: sourceHash,
    databaseFingerprint: databaseHash,
    validation: {
      expectedEntryCount: 413,
      actualEntryCount: source.entries.length,
      sourceCounts: sourceCounts,
      serialsUniqueAndComplete: true,
      sourceCountsMatchOfficialTotals: true
    },
    summary: {
      officialEntries: source.entries.length,
      exactDatabaseMatches: results.filter((result) => result.matchStatus === 'matched').length,
      whitespaceNormalizedMatches: results.filter((result) => result.matchStatus === 'matched-whitespace-normalized').length,
      classificationsToChange: changed.length,
      alreadyCorrectlyClassified: alreadyCorrect.length,
      safeVillagesToCreate: plan.filter((item) => item.operation === 'create').length,
      unresolvedOfficialEntries: unresolvedOfficialEntries.length,
      missingBlocks: resultCounts['missing-block'] ?? 0,
      ambiguousBlocks: resultCounts['ambiguous-block'] ?? 0,
      missingGramPanchayats: resultCounts['missing-gram-panchayat'] ?? 0,
      ambiguousGramPanchayats: resultCounts['ambiguous-gram-panchayat'] ?? 0,
      ambiguousVillages: resultCounts['ambiguous-village'] ?? 0,
      duplicateOfficialEntries:
        (resultCounts['duplicate-official-entry'] ?? 0) + (resultCounts['duplicate-official-identity'] ?? 0),
      existingDatabaseVillagesAbsentFromOfficialPdf: databaseVillagesAbsentFromSource.length,
      countersNeedingReconciliation: countersNeedingReconciliation.length,
      counterReconciliationBlockedByUnresolvedMatches: !applyReady,
      applyReady
    },
    statusCountsByBlock: Object.fromEntries(countsByBlock),
    officialEntryResults: results,
    proposedChanges: {
      updates: changed,
      alreadyCorrect,
      creates: results.filter((result) => result.matchStatus === 'safe-to-create'),
      unresolved: unresolvedOfficialEntries
    },
    databaseVillagesAbsentFromOfficialPdf: databaseVillagesAbsentFromSource,
    currentCounterReconciliation: counterReconciliation,
    countersNeedingReconciliation
  };
}

function writeReconciliationReports(report: Awaited<ReturnType<typeof buildDryRun>>, directory: string): void {
  const reportDirectory = path.resolve(directory);
  fs.mkdirSync(reportDirectory, { recursive: true });

  const officialResults = report.officialEntryResults as Record<string, unknown>[];
  const unmatchedDatabaseVillages = report.databaseVillagesAbsentFromOfficialPdf as Record<string, unknown>[];
  const isSameBlockVillageCandidate = (row: Record<string, unknown>, key: string) => {
    const matches = row[key] as Array<{ evidence?: string[] }> | undefined;
    return Boolean(matches?.some((candidate) => candidate.evidence?.some((evidence) => evidence.startsWith('block:'))));
  };
  const officialReportRows = officialResults.map((row) => ({
    ...row,
    reconciliationCategory: row.matchStatus === 'matched'
      ? 'normalized-hierarchy-match'
      : row.matchStatus === 'matched-whitespace-normalized'
        ? 'whitespace-normalized-hierarchy-match'
        : row.matchStatus === 'safe-to-create'
          ? 'potential-new-village-unverified'
          : row.matchStatus === 'missing-gram-panchayat'
            ? 'missing-exact-parent-name-match'
            : row.matchStatus
  }));
  const databaseReportRows = unmatchedDatabaseVillages.map((row) => ({
    ...row,
    reconciliationCategory: isSameBlockVillageCandidate(row, 'possibleOfficialEntries')
      ? 'possible-official-name-match-parent-unresolved'
      : 'no-normalized-official-village-name-candidate'
  }));
  const columns = [
    'serial', 'district', 'block', 'gramPanchayat', 'village', 'officialStatus',
    'matchStatus', 'reconciliationCategory', 'villageId', 'currentStatus', 'proposedStatus',
    'classificationChangeRequired', 'parentNameSuggestions', 'potentialMatches'
  ];
  fs.writeFileSync(
    path.join(reportDirectory, 'official-entries.csv'),
    toCsv(officialReportRows, columns),
    'utf8'
  );
  fs.writeFileSync(
    path.join(reportDirectory, 'unmatched-database-villages.csv'),
    toCsv(databaseReportRows, [
      'villageId', 'blockId', 'block', 'blockEnglish', 'gramPanchayatId',
      'gramPanchayat', 'gramPanchayatEnglish', 'village', 'villageEnglish',
      'currentStatus', 'reconciliationCategory', 'possibleOfficialEntries'
    ]),
    'utf8'
  );
  fs.writeFileSync(path.join(reportDirectory, 'dry-run.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');

  const reasonCategories = officialResults.reduce<Record<string, number>>((counts, row) => {
    const category = String(row.matchStatus);
    counts[category] = (counts[category] ?? 0) + 1;
    return counts;
  }, {});
  const unresolvedResults = officialResults.filter((row) =>
    row.matchStatus !== 'matched'
    && row.matchStatus !== 'matched-whitespace-normalized'
    && row.matchStatus !== 'safe-to-create'
  );
  const topParentSimilarity = (row: Record<string, unknown>) => {
    const suggestions = row.parentNameSuggestions as Array<{ similarity: number }> | undefined;
    return suggestions?.[0]?.similarity ?? 0;
  };
  const summary = {
    ...report.summary,
    generatedAt: report.generatedAt,
    mode: report.mode,
    sourceFile: report.sourceFile,
    sourceSha256: report.sourceSha256,
    databaseFingerprint: report.databaseFingerprint,
    validation: report.validation,
    reasonCategories,
    unmatchedDatabaseVillageCount: unmatchedDatabaseVillages.length,
    diagnostics: {
      unresolvedWithParentNameSuggestions: unresolvedResults.filter((row) =>
        Array.isArray(row.parentNameSuggestions) && row.parentNameSuggestions.length > 0
      ).length,
      unresolvedWithSameBlockVillageNameCandidate: unresolvedResults.filter((row) =>
        isSameBlockVillageCandidate(row, 'potentialMatches')
      ).length,
      unresolvedWithNoNormalizedVillageNameCandidate: unresolvedResults.filter((row) =>
        !Array.isArray(row.potentialMatches) || row.potentialMatches.length === 0
      ).length,
      topParentNameSimilarityAtLeast90: unresolvedResults.filter((row) => topParentSimilarity(row) >= 0.9).length,
      topParentNameSimilarity80To89: unresolvedResults.filter((row) => topParentSimilarity(row) >= 0.8 && topParentSimilarity(row) < 0.9).length,
      topParentNameSimilarity60To79: unresolvedResults.filter((row) => topParentSimilarity(row) >= 0.6 && topParentSimilarity(row) < 0.8).length,
      topParentNameSimilarityBelow60: unresolvedResults.filter((row) => topParentSimilarity(row) > 0 && topParentSimilarity(row) < 0.6).length,
      unmatchedDatabaseWithSameBlockOfficialVillageNameCandidate: unmatchedDatabaseVillages.filter((row) =>
        isSameBlockVillageCandidate(row, 'possibleOfficialEntries')
      ).length,
      unmatchedDatabaseWithNoNormalizedOfficialVillageNameCandidate: unmatchedDatabaseVillages.filter((row) =>
        !Array.isArray(row.possibleOfficialEntries) || row.possibleOfficialEntries.length === 0
      ).length,
      candidateMatchesAreSuggestionsOnly: true
    },
    aliasMatchesConfirmed: 0,
    aliasMatchesNote: 'No alias source or verified alias mapping was present; candidates are suggestions only.',
    hierarchyCorrectionsConfirmed: 0,
    hierarchyCorrectionsNote: 'No parent relationship was changed or inferred.'
  };
  fs.writeFileSync(path.join(reportDirectory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8');
}

function parseArguments(args: string[]) {
  const options: { apply: boolean; report?: string; reconciliationDir?: string; reviewedReport?: string; backup?: string } = { apply: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--apply') options.apply = true;
    else if (argument === '--report') options.report = args[++index];
    else if (argument === '--reconciliation-dir') options.reconciliationDir = args[++index];
    else if (argument === '--reviewed-report') options.reviewedReport = args[++index];
    else if (argument === '--backup') options.backup = args[++index];
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

function verifyBackup(backupPath: string): { sha256: string; sizeBytes: number } {
  if (!fs.existsSync(backupPath)) throw new Error('The specified backup file does not exist.');
  const stat = fs.statSync(backupPath);
  if (!stat.isFile() || stat.size === 0) throw new Error('The specified backup file is empty or invalid.');
  const manifestPath = `${backupPath}.verified.json`;
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Backup has no verification manifest. Create and verify a fresh database backup before applying.');
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    sha256?: string;
    sizeBytes?: number;
    verification?: string;
  };
  const actualHash = sha256(fs.readFileSync(backupPath));
  if (
    manifest.sha256 !== actualHash
    || manifest.sizeBytes !== stat.size
    || manifest.verification !== 'pg_restore-extract-verified'
  ) {
    throw new Error('Backup verification manifest does not match the specified backup.');
  }
  return { sha256: actualHash, sizeBytes: stat.size };
}

async function applyPlan(options: ReturnType<typeof parseArguments>): Promise<void> {
  if (!options.reviewedReport || !options.backup) {
    throw new Error('--apply requires --reviewed-report and --backup.');
  }
  const reviewedReport = JSON.parse(fs.readFileSync(options.reviewedReport, 'utf8')) as {
    sourceSha256?: string;
    databaseFingerprint?: string;
    summary?: { applyReady?: boolean };
  };
  const backup = verifyBackup(options.backup);
  const current = await buildDryRun(prisma);
  if (reviewedReport.sourceSha256 !== current.sourceSha256) {
    throw new Error('The official source data differs from the reviewed dry-run report.');
  }
  if (reviewedReport.databaseFingerprint !== current.databaseFingerprint) {
    throw new Error('The database hierarchy/classifications changed since the reviewed dry run.');
  }
  if (!reviewedReport.summary?.applyReady || !current.summary.applyReady) {
    throw new Error('Unmatched or unrepresented villages remain. No database changes were made.');
  }

  const expectedFingerprint = current.databaseFingerprint;
  const applied = await prisma.$transaction(async (transaction) => {
    const transactionalSnapshot = await loadSnapshot(transaction);
    if (snapshotFingerprint(transactionalSnapshot) !== expectedFingerprint) {
      throw new Error('The database changed before the transaction began. No database changes were made.');
    }
    const updates = current.proposedChanges.updates as Record<string, unknown>[];
    const creates = current.proposedChanges.creates as Record<string, unknown>[];
    const updatedIds: number[] = [];
    const createdIds: number[] = [];

    for (const item of updates) {
      const villageId = item.villageId as number;
      await transaction.village.update({
        where: { id: villageId },
        data: { affectedStatus: item.proposedStatus as VillageAffectedStatus }
      });
      updatedIds.push(villageId);
    }

    for (const item of creates) {
      const entry = item as Record<string, unknown>;
      const created = await transaction.village.create({
        data: {
          nameHindi: entry.village as string,
          nameEnglish: entry.village as string,
          affectedStatus: entry.proposedStatus as VillageAffectedStatus,
          gramPanchayatId: entry.gramPanchayatId as number
        },
        select: { id: true }
      });
      createdIds.push(created.id);
    }

    const updatedHierarchy = await transaction.block.findMany({
      include: {
        gramPanchayats: {
          include: { villages: { select: { affectedStatus: true } } }
        }
      }
    });
    for (const block of updatedHierarchy) {
      let blockDirect = 0;
      let blockIndirect = 0;
      let blockTotal = 0;
      for (const panchayat of block.gramPanchayats) {
        const direct = panchayat.villages.filter((village) =>
          village.affectedStatus === VILLAGE_AFFECTED_STATUS.DIRECT
          || village.affectedStatus === VILLAGE_AFFECTED_STATUS.BOTH
        ).length;
        const indirect = panchayat.villages.filter((village) =>
          village.affectedStatus === VILLAGE_AFFECTED_STATUS.INDIRECT
          || village.affectedStatus === VILLAGE_AFFECTED_STATUS.BOTH
        ).length;
        await transaction.gramPanchayat.update({
          where: { id: panchayat.id },
          data: {
            totalVillages: panchayat.villages.length,
            directAffectedVillages: direct,
            indirectAffectedVillages: indirect
          }
        });
        blockTotal += panchayat.villages.length;
        blockDirect += direct;
        blockIndirect += indirect;
      }
      await transaction.block.update({
        where: { id: block.id },
        data: {
          totalVillages: blockTotal,
          directAffectedVillages: blockDirect,
          indirectAffectedVillages: blockIndirect
        }
      });
    }

    return { updatedIds, createdIds };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  const resultPath = `${options.reviewedReport}.applied.json`;
  fs.writeFileSync(resultPath, JSON.stringify({
    appliedAt: new Date().toISOString(),
    sourceSha256: current.sourceSha256,
    databaseFingerprintBeforeApply: current.databaseFingerprint,
    backup: { path: path.resolve(options.backup), ...backup },
    updatedVillageIds: applied.updatedIds,
    createdVillageIds: applied.createdIds,
    alreadyCorrectCount: current.summary.alreadyCorrectlyClassified
  }, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({
    result: 'applied',
    updated: applied.updatedIds.length,
    created: applied.createdIds.length,
    alreadyCorrect: current.summary.alreadyCorrectlyClassified,
    applyReport: resultPath
  }, null, 2));
}

async function main(): Promise<void> {
  const options = parseArguments(process.argv.slice(2));
  if (options.apply) {
    if (options.reconciliationDir) {
      throw new Error('--reconciliation-dir is only valid for a read-only dry run.');
    }
    await applyPlan(options);
    return;
  }
  if (options.reviewedReport || options.backup) {
    throw new Error('--reviewed-report and --backup are only valid with --apply.');
  }

  const report = await buildDryRun(prisma);
  if (options.reconciliationDir) writeReconciliationReports(report, options.reconciliationDir);
  if (options.report) {
    const reportPath = path.resolve(options.report);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log(JSON.stringify({
      reportPath,
      reconciliationDirectory: options.reconciliationDir ? path.resolve(options.reconciliationDir) : undefined,
      ...report.summary,
      validation: report.validation
    }, null, 2));
  } else {
    if (options.reconciliationDir) {
      console.log(JSON.stringify({
        reconciliationDirectory: path.resolve(options.reconciliationDir),
        ...report.summary,
        validation: report.validation
      }, null, 2));
    } else {
      console.log(JSON.stringify(report, null, 2));
    }
  }
}

if (require.main === module) {
  main()
    .catch((error: unknown) => {
      console.error(`Village affected-area import failed: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
