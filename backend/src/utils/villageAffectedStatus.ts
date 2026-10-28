export const VILLAGE_AFFECTED_STATUS = {
  DIRECT: 'Direct Affected',
  BOTH: 'Direct and Indirect Both',
  INDIRECT: 'Indirect Affected',
  UNAFFECTED: 'Unaffected'
} as const;

export type VillageAffectedStatus =
  (typeof VILLAGE_AFFECTED_STATUS)[keyof typeof VILLAGE_AFFECTED_STATUS];

export function isDirectlyAffected(status: string): boolean {
  return status === VILLAGE_AFFECTED_STATUS.DIRECT
    || status === VILLAGE_AFFECTED_STATUS.BOTH;
}

export function isIndirectlyAffected(status: string): boolean {
  return status === VILLAGE_AFFECTED_STATUS.INDIRECT
    || status === VILLAGE_AFFECTED_STATUS.BOTH;
}

export function affectedVillageCounts(statuses: string[]) {
  return {
    totalVillages: statuses.length,
    directAffectedVillages: statuses.filter(isDirectlyAffected).length,
    indirectAffectedVillages: statuses.filter(isIndirectlyAffected).length,
    unaffectedVillages: statuses.filter((status) => status === VILLAGE_AFFECTED_STATUS.UNAFFECTED).length
  };
}
