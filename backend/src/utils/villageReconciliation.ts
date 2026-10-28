export type ReconciliationIdentity = {
  block: string;
  blockEnglish?: string;
  gramPanchayat: string;
  gramPanchayatEnglish?: string;
  village: string;
  villageEnglish?: string;
};

export type ReconciliationCandidate = ReconciliationIdentity & {
  villageId: number;
  blockId: number;
  gramPanchayatId: number;
  currentStatus: string;
};

export type RankedCandidate = ReconciliationCandidate & {
  score: number;
  evidence: string[];
};

export type ParentNameCandidate = {
  id: number;
  nameHindi: string;
  nameEnglish: string;
  similarity: number;
  reviewRequired: true;
};

export function normalizeIdentity(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .toLocaleLowerCase('hi-IN');
}

function compactIdentity(value: string): string {
  return normalizeIdentity(value).replace(/\s/gu, '');
}

function nameEvidence(source: string, candidateNames: string[], label: string): { score: number; evidence: string[] } {
  const sourceKey = normalizeIdentity(source);
  const candidateKeys = candidateNames.filter(Boolean).map(normalizeIdentity);
  if (candidateKeys.includes(sourceKey)) return { score: 100, evidence: [`${label}:normalized-exact`] };

  const compactKey = compactIdentity(source);
  if (candidateNames.filter(Boolean).some((name) => compactIdentity(name) === compactKey)) {
    return { score: 90, evidence: [`${label}:whitespace-normalized`] };
  }
  return { score: 0, evidence: [] };
}

export function rankVillageCandidates(
  official: ReconciliationIdentity,
  candidates: ReconciliationCandidate[],
  limit = 10
): RankedCandidate[] {
  return candidates
    .map((candidate) => {
      const village = nameEvidence(official.village, [candidate.village, candidate.villageEnglish ?? ''], 'village');
      if (!village.score) return null;
      const block = nameEvidence(official.block, [candidate.block, candidate.blockEnglish ?? ''], 'block');
      const panchayat = nameEvidence(
        official.gramPanchayat,
        [candidate.gramPanchayat, candidate.gramPanchayatEnglish ?? ''],
        'gram-panchayat'
      );
      return {
        ...candidate,
        score: village.score + block.score / 10 + panchayat.score / 10,
        evidence: [...village.evidence, ...block.evidence, ...panchayat.evidence]
      };
    })
    .filter((candidate): candidate is RankedCandidate => candidate !== null)
    .sort((left, right) =>
      right.score - left.score
      || left.blockId - right.blockId
      || left.gramPanchayatId - right.gramPanchayatId
      || left.villageId - right.villageId
    )
    .slice(0, limit);
}

function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = previous[0];
    previous[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const above = previous[rightIndex];
      previous[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + 1,
        diagonal + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1)
      );
      diagonal = above;
    }
  }
  return previous[right.length];
}

export function rankParentNameCandidates(
  officialName: string,
  candidates: Array<{ id: number; nameHindi: string; nameEnglish: string }>,
  limit = 5
): ParentNameCandidate[] {
  const normalizedOfficial = normalizeIdentity(officialName);
  return candidates
    .map((candidate) => {
      const normalizedNames = [candidate.nameHindi, candidate.nameEnglish]
        .map(normalizeIdentity)
        .filter(Boolean);
      const similarity = Math.max(...normalizedNames.map((name) =>
        1 - editDistance(normalizedOfficial, name) / Math.max(normalizedOfficial.length, name.length, 1)
      ));
      return { ...candidate, similarity, reviewRequired: true as const };
    })
    .filter((candidate) => candidate.similarity >= 0.3)
    .sort((left, right) => right.similarity - left.similarity || left.id - right.id)
    .slice(0, limit);
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const escape = (value: unknown) => {
    const text = value === null || value === undefined
      ? ''
      : typeof value === 'string'
        ? value
        : JSON.stringify(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [
    columns.map(escape).join(','),
    ...rows.map((row) => columns.map((column) => escape(row[column])).join(','))
  ].join('\r\n') + '\r\n';
}
