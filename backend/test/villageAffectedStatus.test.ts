import assert from 'node:assert/strict';
import test from 'node:test';
import {
  affectedVillageCounts,
  VILLAGE_AFFECTED_STATUS
} from '../src/utils/villageAffectedStatus';
import { rankParentNameCandidates, rankVillageCandidates, toCsv } from '../src/utils/villageReconciliation';

const source = require('../src/data/officialVillageAffectedAreas2026.json') as {
  entryCount: number;
  entries: { serial: number; officialStatus: string }[];
};

test('both-affected villages count once in total and once in each affected category', () => {
  assert.deepEqual(
    affectedVillageCounts([
      VILLAGE_AFFECTED_STATUS.DIRECT,
      VILLAGE_AFFECTED_STATUS.BOTH,
      VILLAGE_AFFECTED_STATUS.INDIRECT
    ]),
    {
      totalVillages: 3,
      directAffectedVillages: 2,
      indirectAffectedVillages: 2,
      unaffectedVillages: 0
    }
  );
});

test('unaffected villages count only toward the distinct total', () => {
  assert.deepEqual(
    affectedVillageCounts([
      VILLAGE_AFFECTED_STATUS.BOTH,
      VILLAGE_AFFECTED_STATUS.UNAFFECTED
    ]),
    {
      totalVillages: 2,
      directAffectedVillages: 1,
      indirectAffectedVillages: 1,
      unaffectedVillages: 1
    }
  );
});

test('checked-in PDF extraction preserves all 413 official status totals', () => {
  const counts = source.entries.reduce<Record<string, number>>((result, entry) => {
    result[entry.officialStatus] = (result[entry.officialStatus] ?? 0) + 1;
    return result;
  }, {});

  assert.equal(source.entryCount, 413);
  assert.equal(new Set(source.entries.map((entry) => entry.serial)).size, 413);
  assert.deepEqual(Object.values(counts).sort((a, b) => a - b), [31, 123, 129, 130]);
});

test('reconciliation ranks full hierarchy matches above same-name villages in other parents', () => {
  const official = {
    block: 'नारायणपुर',
    gramPanchayat: 'ग्राम पंचायत',
    village: 'खैराभाट'
  };
  const candidates = [
    {
      villageId: 20,
      blockId: 2,
      gramPanchayatId: 3,
      block: 'ओरछा',
      gramPanchayat: 'अन्य पंचायत',
      village: 'खैराभाट',
      currentStatus: 'Unaffected'
    },
    {
      villageId: 10,
      blockId: 1,
      gramPanchayatId: 4,
      block: 'नारायणपुर',
      gramPanchayat: 'ग्राम पंचायत',
      village: 'खैरा भाट',
      currentStatus: 'Direct Affected'
    }
  ];

  const ranked = rankVillageCandidates(official, candidates);
  assert.equal(ranked[0].villageId, 10);
  assert.deepEqual(ranked[0].evidence, [
    'village:whitespace-normalized',
    'block:normalized-exact',
    'gram-panchayat:normalized-exact'
  ]);
  assert.equal(ranked[1].villageId, 20);
});

test('reconciliation normalizes Unicode compatibility characters and escapes CSV', () => {
  const [candidate] = rankVillageCandidates(
    { block: 'नारायणपुर', gramPanchayat: 'नगर', village: 'Ａ' },
    [{
      villageId: 1,
      blockId: 1,
      gramPanchayatId: 1,
      block: 'नारायणपुर',
      gramPanchayat: 'नगर',
      village: 'A',
      currentStatus: 'Unaffected'
    }]
  );
  assert.ok(candidate.evidence.includes('village:normalized-exact'));
  assert.equal(toCsv([{ village: 'name, with "quotes"' }], ['village']), '"village"\r\n"name, with ""quotes"""\r\n');
});

test('similar parent names are suggestions only and explicitly require review', () => {
  const [suggestion] = rankParentNameCandidates('सुलेंगा (गुरिया)', [
    { id: 2, nameHindi: 'सुलेंगा(गु०)', nameEnglish: 'Sulenga (Guriya)' },
    { id: 3, nameHindi: 'अन्य पंचायत', nameEnglish: 'Other' }
  ]);
  assert.equal(suggestion.id, 2);
  assert.equal(suggestion.reviewRequired, true);
  assert.ok(suggestion.similarity > 0.3);
});
